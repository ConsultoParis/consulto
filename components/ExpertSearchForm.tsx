"use client";

import { useState } from "react";
import type { Profession } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/types";
import { MapPin } from "lucide-react";
import CityAutocomplete from "@/components/CityAutocomplete";

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
  defaultVille,
}: {
  defaultQ?: string;
  defaultProfession?: string;
  defaultSpecialite?: string;
  defaultVille?: string;
}) {
  const [profession, setProfession] = useState(defaultProfession || "");
  const [ville, setVille] = useState(defaultVille || "");
  const [locating, setLocating] = useState(false);
  const subOptions = SPECIALITES[profession];

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "";
          if (city) setVille(city);
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false)
    );
  }

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

      <div className="flex flex-1 gap-2 sm:w-56 sm:flex-none">
        <div className="flex-1">
          <CityAutocomplete
            name="ville"
            value={ville}
            onChange={setVille}
            placeholder="Ville"
            className={inputClass + " w-full"}
            style={inputStyle}
          />
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          title="Utiliser ma position"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border transition hover:border-[#3E8EF7] disabled:opacity-50"
          style={{ borderColor: "var(--border)" }}
        >
          <MapPin className="h-4 w-4" style={{ color: locating ? undefined : "#3E8EF7" }} />
        </button>
      </div>

      <button type="submit" className="btn-primary rounded-[3px] px-6 py-2.5 text-sm font-medium">
        Rechercher
      </button>
    </form>
  );
}
