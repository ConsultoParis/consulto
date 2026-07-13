"use client";

import { useState } from "react";
import type { Profession } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/types";

const inputClass = "rounded-[3px] border px-4 py-2.5 text-[15px] outline-none";
const inputStyle = { borderColor: "var(--border)", backgroundColor: "var(--input-bg)", color: "var(--text)" };

const SPECIALITES: Record<string, string[]> = {
  medecin: ["Médecin généraliste", "Dermatologue", "Psychiatre"],
  avocat: ["Droit du travail", "Droit de la famille", "Droit immobilier / logement"],
};

export default function ExpertSearchForm({
  defaultQ,
  defaultProfession,
  defaultSpecialite,
}: {
  defaultQ?: string;
  defaultProfession?: string;
  defaultSpecialite?: string;
}) {
  const [profession, setProfession] = useState(defaultProfession || "");
  const subOptions = SPECIALITES[profession];

  return (
    <form className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap" method="get">
      <input
        type="text"
        name="q"
        defaultValue={defaultQ}
        placeholder="Nom, spécialité..."
        className={`${inputClass} flex-1`}
        style={inputStyle}
      />
      <select
        name="profession"
        value={profession}
        onChange={(e) => setProfession(e.target.value)}
        className={`${inputClass} sm:w-56`}
        style={inputStyle}
      >
        <option value="">Toutes les professions</option>
        {(Object.keys(PROFESSION_LABELS) as Profession[]).map((p) => (
          <option key={p} value={p}>
            {PROFESSION_LABELS[p]}
          </option>
        ))}
      </select>

      {subOptions && (
        <select name="specialite" defaultValue={defaultSpecialite || ""} className={`${inputClass} sm:w-56`} style={inputStyle}>
          <option value="">Toutes les spécialités</option>
          {subOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      <button type="submit" className="btn-primary rounded-[3px] px-6 py-2.5 text-sm font-medium">
        Rechercher
      </button>
    </form>
  );
}
