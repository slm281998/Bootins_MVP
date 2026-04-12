import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/axios";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export default function VerifyCertificate() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`certificate/verify/${token}/`)
      .then(res => setData(res.data))
      .catch(() => setError(true));
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <ShieldCheck size={40} className="text-primary" />
          </div>
        </div>

        <h1 className="text-xl font-bold mb-6 text-slate-800 underline decoration-primary decoration-4">
          Vérification du certificat
        </h1>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3 justify-center">
            <XCircle /> <strong>Certificat invalide</strong>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-3 justify-center font-bold">
              <CheckCircle2 /> Certificat valide
            </div>

            <div className="text-left space-y-3 text-slate-600 border-t pt-6">
              <p><strong>| Nom :</strong> {data.apprenant}</p>
              <p><strong>| Formation :</strong> {data.formation}</p>
              <p><strong>| Date d'obtention :</strong> {data.date}</p>
              <p><strong>| Organisme :</strong> Bootins</p>
            </div>
          </div>
        ) : (
          <p>Analyse de l'authenticité...</p>
        )}
      </div>
      <p className="mt-8 text-slate-400 text-sm font-bold tracking-widest uppercase italic">Bootins Academy</p>
    </div>
  );
}