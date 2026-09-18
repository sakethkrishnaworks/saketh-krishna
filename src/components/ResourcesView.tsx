'use client';

import { useEffect, useState } from 'react';
import { Calculator, Check, ListChecks, RotateCcw, ShoppingBasket } from 'lucide-react';
import { GROCERY_LIST, MEAL_PREP_CHECKLIST } from '../data';

type ResourceTab = 'calculators' | 'grocery' | 'prep';
type CalculatorKind = 'protein' | 'bmi' | 'calories';

function useChecklist(key: string, items: string[]) {
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as boolean[];
        if (Array.isArray(parsed) && parsed.length === items.length) return parsed;
      }
    } catch { /* start fresh */ }
    return items.map(() => false);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(checked));
    } catch { /* storage unavailable */ }
  }, [checked, key]);

  return { checked, setChecked };
}

function ChecklistBlock({ storageKey, items, doneLabel }: { storageKey: string; items: string[]; doneLabel: string }) {
  const { checked, setChecked } = useChecklist(storageKey, items);
  const done = checked.filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-sans text-xs text-[#a0a0a0]">{done} of {items.length} {doneLabel}</span>
        <button
          type="button"
          onClick={() => setChecked(items.map(() => false))}
          className="inline-flex items-center gap-1 font-sans text-[10px] font-bold tracking-wider uppercase text-[#a0a0a0] hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => setChecked(checked.map((value, i) => (i === index ? !value : value)))}
            aria-pressed={checked[index]}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all active:scale-[0.99] ${
              checked[index]
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#D2B48C]/30'
            }`}
          >
            <span className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
              checked[index] ? 'bg-emerald-500 border-emerald-500' : 'border-[#4a4a4a]'
            }`}>
              {checked[index] && <Check className="w-3.5 h-3.5 text-white" />}
            </span>
            <span className={`font-sans text-sm ${checked[index] ? 'text-white/40 line-through' : 'text-white'}`}>
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, suffix }: {
  label: string; value: string; onChange: (value: string) => void; min?: number; max?: number; suffix?: string;
}) {
  return (
    <label className="block">
      <span className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1.5">{label}</span>
      <div className="flex items-center bg-[#0c0c0b] border border-[#2a2a2a] rounded-lg px-4 focus-within:border-[#D2B48C] transition-colors">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-white font-sans text-sm py-3 focus:outline-none"
        />
        {suffix && <span className="font-sans text-xs text-[#a0a0a0] ml-2 flex-shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function ResultCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-xl bg-[#D2B48C]/10 border border-[#D2B48C]/30 p-5 text-center">
      {children}
    </div>
  );
}

function ProteinCalculator() {
  const [weight, setWeight] = useState('70');
  const [goal, setGoal] = useState('loss');
  const kg = Number(weight);
  const factor = goal === 'gain' ? 2.0 : goal === 'maintain' ? 1.6 : 1.8;
  const valid = Number.isFinite(kg) && kg > 20 && kg < 300;
  const grams = valid ? Math.round(kg * factor) : 0;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Body weight" value={weight} onChange={setWeight} min={20} max={300} suffix="kg" />
        <SelectField label="Goal" value={goal} onChange={setGoal} options={[
          { value: 'loss', label: 'Fat loss' },
          { value: 'gain', label: 'Muscle gain' },
          { value: 'maintain', label: 'Maintain' },
        ]} />
      </div>
      {valid && (
        <ResultCard>
          <p className="font-serif text-3xl font-bold text-white">{grams}g</p>
          <p className="font-sans text-xs text-[#D2B48C] mt-1">protein per day · ~{Math.round(grams / 4)}g per meal across 4 meals</p>
        </ResultCard>
      )}
    </div>
  );
}

function BmiCalculator() {
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const cm = Number(height);
  const kg = Number(weight);
  const valid = Number.isFinite(cm) && cm > 100 && cm < 250 && Number.isFinite(kg) && kg > 20 && kg < 300;
  const bmi = valid ? kg / ((cm / 100) ** 2) : 0;
  const category = !valid ? '' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese';

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Height" value={height} onChange={setHeight} min={100} max={250} suffix="cm" />
        <NumberField label="Weight" value={weight} onChange={setWeight} min={20} max={300} suffix="kg" />
      </div>
      {valid && (
        <ResultCard>
          <p className="font-serif text-3xl font-bold text-white">{bmi.toFixed(1)}</p>
          <p className="font-sans text-xs text-[#D2B48C] mt-1">{category} range</p>
        </ResultCard>
      )}
    </div>
  );
}

function CalorieCalculator() {
  const [age, setAge] = useState('30');
  const [sex, setSex] = useState('male');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('loss');

  const a = Number(age);
  const cm = Number(height);
  const kg = Number(weight);
  const valid = [a, cm, kg].every(Number.isFinite) && a > 10 && a < 100 && cm > 100 && cm < 250 && kg > 20 && kg < 300;
  const bmr = sex === 'male' ? 10 * kg + 6.25 * cm - 5 * a + 5 : 10 * kg + 6.25 * cm - 5 * a - 161;
  const factors: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  const offsets: Record<string, number> = { loss: -400, maintain: 0, gain: 300 };
  const target = valid ? Math.round(bmr * (factors[activity] ?? 1.55) + (offsets[goal] ?? 0)) : 0;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Age" value={age} onChange={setAge} min={10} max={100} suffix="yrs" />
        <SelectField label="Sex" value={sex} onChange={setSex} options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]} />
        <NumberField label="Height" value={height} onChange={setHeight} min={100} max={250} suffix="cm" />
        <NumberField label="Weight" value={weight} onChange={setWeight} min={20} max={300} suffix="kg" />
        <SelectField label="Activity" value={activity} onChange={setActivity} options={[
          { value: 'sedentary', label: 'Sedentary' },
          { value: 'light', label: 'Light (1-3 days)' },
          { value: 'moderate', label: 'Moderate (3-5 days)' },
          { value: 'active', label: 'Athletic (6-7 days)' },
        ]} />
        <SelectField label="Goal" value={goal} onChange={setGoal} options={[
          { value: 'loss', label: 'Fat loss' },
          { value: 'maintain', label: 'Maintain' },
          { value: 'gain', label: 'Muscle gain' },
        ]} />
      </div>
      {valid && (
        <ResultCard>
          <p className="font-serif text-3xl font-bold text-white">{target.toLocaleString('en-IN')}</p>
          <p className="font-sans text-xs text-[#D2B48C] mt-1">kcal per day target</p>
        </ResultCard>
      )}
    </div>
  );
}

export default function ResourcesView() {
  const [tab, setTab] = useState<ResourceTab>('calculators');
  const [calculator, setCalculator] = useState<CalculatorKind>('protein');

  const tabs: Array<{ id: ResourceTab; label: string; icon: typeof Calculator }> = [
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'grocery', label: 'Grocery List', icon: ShoppingBasket },
    { id: 'prep', label: 'Prep Checklist', icon: ListChecks },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0b] pt-14 pb-10 px-5 safe-bottom">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight mb-2">
            Free Resources
          </h1>
          <p className="font-sans text-xs text-[#a0a0a0]">Tools to plan your week like a coach</p>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg font-sans text-[10px] font-bold tracking-wider uppercase transition-all ${
                tab === id
                  ? 'bg-[#D2B48C] text-[#0c0c0b]'
                  : 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {tab === 'calculators' && (
          <div>
            <div className="flex gap-2 mb-5">
              {(['protein', 'bmi', 'calories'] as CalculatorKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setCalculator(kind)}
                  className={`flex-1 px-2 py-2 rounded-lg font-sans text-[10px] font-semibold tracking-wider uppercase transition-all ${
                    calculator === kind
                      ? 'bg-[#D2B48C]/15 text-[#D2B48C] border border-[#D2B48C]/40'
                      : 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a] hover:text-white'
                  }`}
                >
                  {kind === 'protein' ? 'Protein' : kind === 'bmi' ? 'BMI' : 'Calories'}
                </button>
              ))}
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              {calculator === 'protein' && <ProteinCalculator />}
              {calculator === 'bmi' && <BmiCalculator />}
              {calculator === 'calories' && <CalorieCalculator />}
              <p className="font-sans text-[10px] text-[#a0a0a0] mt-4 text-center">
                Estimates for planning, not medical advice.
              </p>
            </div>
          </div>
        )}

        {tab === 'grocery' && (
          <ChecklistBlock storageKey="saketh_grocery" items={GROCERY_LIST} doneLabel="in the cart" />
        )}

        {tab === 'prep' && (
          <ChecklistBlock storageKey="saketh_prep" items={MEAL_PREP_CHECKLIST} doneLabel="done" />
        )}
      </div>
    </div>
  );
}
