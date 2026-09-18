'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Loader2, Maximize, Minus, Plus, X } from 'lucide-react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { authedFetch } from '../lib/api';

class ReaderLoadError extends Error {}

interface ReaderModalProps {
  cookbookId: string;
  title: string;
  userLabel: string;
  onClose: () => void;
}

export default function ReaderModal({ cookbookId, title, userLabel, onClose }: ReaderModalProps) {
  const [mounted, setMounted] = useState(false);
  const [online, setOnline] = useState(true);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const disposeRef = useRef<() => void>(() => {});
  const cancelRenderRef = useRef<() => void>(() => {});
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const noticeId = useId();
  onCloseRef.current = onClose;

  useEffect(() => {
    setOnline(navigator.onLine);
    setMounted(true);
    const goOffline = () => {
      disposeRef.current();
      stageRef.current?.replaceChildren();
      setPdf(null);
      setOnline(false);
      setLoading(false);
      setRendering(false);
      setError('');
    };
    const goOnline = () => setOnline(true);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const dialog = dialogRef.current;
    const viewport = viewportRef.current;
    if (!dialog || !viewport) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    closeRef.current?.focus();
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(viewport);
    const keepFocus = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) closeRef.current?.focus();
    };
    document.addEventListener('focusin', keepFocus);
    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', keepFocus);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !online) return;
    let disposed = false;
    let task: PDFDocumentLoadingTask | null = null;
    let bytes: Uint8Array | null = null;
    const controller = new AbortController();
    const clearBytes = () => {
      if (bytes?.byteLength) bytes.fill(0);
      bytes = null;
    };
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      controller.abort();
      cancelRenderRef.current();
      stageRef.current?.replaceChildren();
      clearBytes();
      if (task) void task.destroy().catch(() => {});
      task = null;
    };
    disposeRef.current = dispose;
    setPdf(null);
    setPage(1);
    setZoom(1);
    setLoading(true);
    setError('');

    const load = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        if (disposed) return;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        const response = await authedFetch(`/api/cookbook-pdf?cookbookId=${encodeURIComponent(cookbookId)}`, {
          signal: controller.signal,
          cache: 'no-store',
          redirect: 'error',
          headers: { Accept: 'application/pdf' },
        });
        if (disposed) {
          await response.body?.cancel();
          return;
        }
        if (!response.ok) {
          await response.body?.cancel();
          if (response.status === 401) throw new ReaderLoadError('Your session has expired. Close the reader and sign in again.');
          if (response.status === 403) throw new ReaderLoadError('This account does not have access to this cookbook.');
          if (response.status === 404) throw new ReaderLoadError('This cookbook is not available yet. Please try again later.');
          throw new ReaderLoadError('The cookbook could not be loaded. Please try again.');
        }
        if (!response.headers.get('content-type')?.toLowerCase().includes('application/pdf')) {
          await response.body?.cancel();
          throw new ReaderLoadError('The server did not return a PDF. Please try again later.');
        }
        bytes = new Uint8Array(await response.arrayBuffer());
        if (disposed || !navigator.onLine) {
          clearBytes();
          return;
        }
        task = pdfjs.getDocument({ data: bytes, isEvalSupported: false, useSystemFonts: true });
        const document = await task.promise;
        bytes = null;
        if (disposed) return;
        setPdf(document);
        setLoading(false);
      } catch (cause) {
        if (disposed) return;
        dispose();
        setPdf(null);
        setLoading(false);
        setError(cause instanceof ReaderLoadError ? cause.message : 'Unable to open this cookbook. Check your connection and retry.');
      }
    };
    void load();
    return dispose;
  }, [mounted, online, cookbookId, attempt]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!pdf || !online || !stage || !size.width || !size.height) return;
    let cancelled = false;
    let renderTask: RenderTask | null = null;
    const canvas = document.createElement('canvas');
    const cancel = () => {
      cancelled = true;
      renderTask?.cancel();
      canvas.remove();
      if (renderTask) {
        void renderTask.promise.catch(() => {}).then(() => {
          canvas.width = 0;
          canvas.height = 0;
        });
      } else {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
    cancelRenderRef.current = cancel;
    stage.replaceChildren();
    viewportRef.current?.scrollTo(0, 0);
    setRendering(true);
    setError('');
    const render = async () => {
      try {
        const pdfPage = await pdf.getPage(page);
        if (cancelled) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const fit = Math.min(Math.max(1, size.width - 32) / base.width, Math.max(1, size.height - 32) / base.height);
        const viewport = pdfPage.getViewport({ scale: fit * zoom });
        const ratio = Math.min(window.devicePixelRatio || 1, 2, 8192 / viewport.width, 8192 / viewport.height,
          Math.sqrt(16_000_000 / (viewport.width * viewport.height)));
        canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
        canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `${title}, page ${page} of ${pdf.numPages}. Visual PDF page.`);
        const context = canvas.getContext('2d');
        if (!context) throw new ReaderLoadError('Canvas unavailable');
        renderTask = pdfPage.render({ canvasContext: context, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
        await renderTask.promise;
        if (cancelled || !navigator.onLine) return;
        context.save();
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const label = `Licensed to ${userLabel.slice(0, 40)} • Personal reading only`;
        const fontSize = Math.max(10, Math.min(20, viewport.width / 30));
        context.font = `600 ${fontSize}px sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'rgba(70, 48, 26, 0.18)';
        for (const position of [0.25, 0.55, 0.85]) {
          context.save();
          context.translate(viewport.width / 2, viewport.height * position);
          context.rotate(-Math.PI / 8);
          context.fillText(label, 0, 0, viewport.width * 0.86);
          context.restore();
        }
        context.fillStyle = 'rgba(245, 235, 218, 0.88)';
        context.fillRect(0, viewport.height - fontSize * 2.2, viewport.width, fontSize * 2.2);
        context.fillStyle = '#402d10';
        context.fillText(label, viewport.width / 2, viewport.height - fontSize * 1.1, viewport.width - 16);
        context.restore();
        stage.replaceChildren(canvas);
        setRendering(false);
      } catch {
        if (!cancelled) {
          setRendering(false);
          setError('This page could not be rendered. Retry to reload the cookbook.');
        }
      } finally {
        if (cancelled) {
          canvas.width = 0;
          canvas.height = 0;
        }
      }
    };
    void render();
    return () => {
      cancel();
      if (!renderTask) {
        canvas.width = 0;
        canvas.height = 0;
      } else {
        void renderTask.promise.catch(() => {}).then(() => {
          canvas.width = 0;
          canvas.height = 0;
        });
      }
    };
  }, [pdf, online, page, zoom, size, title, userLabel]);

  if (!mounted) return null;
  const ready = online && !!pdf && !loading;
  const changePage = (delta: number) => {
    if (ready) setPage((current) => Math.min(pdf.numPages, Math.max(1, current + delta)));
  };
  const changeZoom = (delta: number) => setZoom((current) => Math.min(3, Math.max(0.5, Math.round((current + delta) * 100) / 100)));

  return createPortal(
    <dialog
      ref={dialogRef}
      className="cookbook-reader"
      aria-labelledby={titleId}
      aria-describedby={noticeId}
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); onCloseRef.current(); }}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === 'Tab') {
          const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]') ?? []);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
          return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || !ready) return;
        if (['ArrowLeft', 'PageUp', 'ArrowRight', 'PageDown', 'Home', 'End', '+', '=', '-', '0'].includes(event.key)) {
          event.preventDefault();
          if (['ArrowLeft', 'PageUp'].includes(event.key)) changePage(-1);
          if (['ArrowRight', 'PageDown'].includes(event.key)) changePage(1);
          if (event.key === 'Home') setPage(1);
          if (event.key === 'End') setPage(pdf.numPages);
          if (['+', '='].includes(event.key)) changeZoom(0.25);
          if (event.key === '-') changeZoom(-0.25);
          if (event.key === '0') setZoom(1);
        }
      }}
    >
      <header className="reader-header">
        <div className="min-w-0">
          <h2 id={titleId} className="font-serif font-semibold truncate">{title}</h2>
          <p className="text-xs text-[#D2B48C]">Online reader · Personal access</p>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close reader (Escape)" className="reader-button">
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="reader-page-area">
        <div ref={viewportRef} className="reader-viewport" tabIndex={0} role="region" aria-label="Book page. Use left and right arrows to turn pages; plus and minus to zoom." aria-busy={loading || rendering}>
          <div ref={stageRef} className="reader-stage" />
        </div>
        {(!online || loading || rendering || error) && (
          <div className="reader-message">
            {!online ? (
              <div role="status"><h3 className="font-serif text-xl mb-2">You’re offline</h3><p>The book has been cleared. Reconnect to reload and keep reading.</p></div>
            ) : error ? (
              <div><p role="alert">{error}</p><button type="button" className="reader-button mx-auto mt-4" onClick={() => setAttempt((value) => value + 1)}>Retry</button></div>
            ) : (
              <div role="status"><Loader2 className="animate-spin mx-auto mb-3" aria-hidden="true" /><p>{loading ? 'Opening your cookbook…' : 'Preparing page…'}</p></div>
            )}
          </div>
        )}
      </div>
      <footer className="reader-footer">
        <nav className="reader-controls" aria-label="Reader controls">
          <div className="reader-control-group">
            <button type="button" className="reader-button" disabled={!ready || page <= 1} onClick={() => changePage(-1)} aria-label="Previous page"><ChevronLeft size={20} aria-hidden="true" /></button>
            <span className="reader-counter" aria-live="polite" aria-atomic="true">{ready ? `Page ${page} of ${pdf.numPages}` : 'Page — of —'}</span>
            <button type="button" className="reader-button" disabled={!ready || page >= pdf.numPages} onClick={() => changePage(1)} aria-label="Next page"><ChevronRight size={20} aria-hidden="true" /></button>
          </div>
          <div className="reader-control-group">
            <button type="button" className="reader-button" disabled={!ready || zoom <= 0.5} onClick={() => changeZoom(-0.25)} aria-label="Zoom out"><Minus size={18} aria-hidden="true" /></button>
            <span className="reader-zoom" aria-label={`${Math.round(zoom * 100)} percent of fit`}>{Math.round(zoom * 100)}%</span>
            <button type="button" className="reader-button" disabled={!ready || zoom >= 3} onClick={() => changeZoom(0.25)} aria-label="Zoom in"><Plus size={18} aria-hidden="true" /></button>
            <button type="button" className="reader-button" disabled={!ready} onClick={() => setZoom(1)} aria-label="Fit whole page"><Maximize size={16} aria-hidden="true" /><span>Fit</span></button>
          </div>
        </nav>
        <p id={noticeId} className="reader-notice">Online-only access control, not absolute DRM. PDF bytes are still in your browser while reading.</p>
      </footer>
    </dialog>,
    document.body,
  );
}
