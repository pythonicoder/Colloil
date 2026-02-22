import ReactMarkdown from "react-markdown";
import { useLanguage } from "../i18n/LanguageContext";


export default function CommunityPage() {
  const { t, language } = useLanguage();

  return (
    <div className="p-6 pb-28 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <article className="prose prose-stone max-w-none">
          <ReactMarkdown key={language}>
          {t("communityContent").trim()}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}