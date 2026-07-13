export type Profession = "avocat" | "notaire" | "medecin" | "garagiste" | "coiffeur";
export type ConsultationMode = "video" | "chat" | "physique";
export type BookingStatus = "confirmed" | "cancelled_by_client" | "cancelled_by_expert" | "completed";
export type PaymentStatus = "pending" | "held" | "released" | "refunded";

export interface Profile {
  id: string;
  role: "client" | "expert" | "admin";
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  credits_balance: number;
  referral_code: string | null;
  created_at: string;
}

export interface Expert {
  id: string;
  profession: Profession;
  specialite: string;
  bio: string | null;
  price: number;
  experience_years: number;
  response_time_min: number;
  languages: string[];
  domains: string[];
  numero_barreau: string | null;
  numero_notaire: string | null;
  numero_rpps: string | null;
  numero_ordre_medecins: string | null;
  numero_siret: string | null;
  certification: string | null;
  verification_status: "pending" | "verified" | "rejected";
  available_now: boolean;
  created_at: string;
  // jointure éventuelle
  profiles?: Profile;
}

export interface AvailabilitySlot {
  id: string;
  expert_id: string;
  date: string;
  start_time: string;
  duration_min: 20 | 30;
  is_booked: boolean;
}

export interface Booking {
  id: string;
  slot_id: string;
  client_id: string;
  expert_id: string;
  date: string;
  start_time: string;
  duration_min: number;
  mode: ConsultationMode;
  price: number;
  credits_used: number;
  stripe_payment_intent_id: string | null;
  payment_status: PaymentStatus;
  status: BookingStatus;
  refunded: boolean;
  client_email: string;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  booking_id: string;
  uploaded_by: "client" | "expert";
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  email_sent: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  expert_id: string;
  client_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const PROFESSION_LABELS: Record<Profession, string> = {
  avocat: "Avocat",
  notaire: "Notaire",
  medecin: "Médecin généraliste",
  garagiste: "Garagiste",
  coiffeur: "Barber / Coiffeur",
};

export const PROFESSION_COLORS: Record<Profession, string> = {
  avocat: "#3457A6",
  notaire: "#8B5E34",
  medecin: "#1E93A6",
  garagiste: "#D98A1F",
  coiffeur: "#C14F82",
};
