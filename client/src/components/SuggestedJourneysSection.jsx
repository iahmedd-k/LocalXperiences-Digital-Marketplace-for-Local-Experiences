import useTranslation from '../hooks/useTranslation.js';
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getPathways, toggleSavePathway } from "../services/pathwayService.js";
import { PathwayCard } from "./PathwayBrowse.jsx";

export default function SuggestedJourneysSection() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user?._id);

  const { data: pathways = [], isLoading } = useQuery({
    queryKey: ["homePathways"],
    queryFn: () => getPathways({ limit: 6 }).then((res) => res.data.data || []),
  });

  const toggleSaveMutation = useMutation({
    mutationFn: toggleSavePathway,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["homePathways"]);
      if (data.isSaved) toast.success("Saved to pathways");
      else toast.success("Removed from saved pathways");
    },
    onError: () => toast.error("Failed to save pathway"),
  });

  const handleSave = (id) => {
    if (!isAuthenticated) {
      toast.error("Please log in to save pathways");
      return navigate("/login");
    }
    toggleSaveMutation.mutate(id);
  };

  if (isLoading || !pathways.length) return null;

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1a6b4a]">{t("sj_badge")}</p>
            <h2 className="mt-2 font-playfair text-3xl font-bold text-slate-900 tracking-tight">{t("sj_title")}</h2>
          </div>
          <Link
            to="/pathways"
            className="hidden shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 sm:block"
          >{t("test_view_all")}</Link>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbars">
          {pathways.map((pathway) => (
            <div key={pathway._id} className="min-w-[300px] max-w-[340px] flex-none snap-start">
               <PathwayCard 
                 pathway={pathway}
                 isSaved={user?.savedPathways?.includes(pathway._id)}
                 onSave={handleSave}
                 onClick={() => navigate(`/pathways/${pathway._id}`)}
               />
            </div>
          ))}
        </div>
        
        <div className="mt-4 sm:hidden">
          <Link
            to="/pathways"
            className="block w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50"
          >{t("sj_view_all_pathways")}</Link>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbars::-webkit-scrollbar { display: none; }
        .hide-scrollbars { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}
