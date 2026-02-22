import ReactMarkdown from "react-markdown";
import { useLanguage } from "../i18n/LanguageContext";

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <div className="p-6 pb-28 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <article className="prose prose-stone max-w-none">
          <ReactMarkdown key={language}>
            {t("aboutContent")}
          </ReactMarkdown>
        </article>

        {/* TEAM SECTION */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            marginTop: "40px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src="/zeynep.jpeg"
              alt="Zeynep"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <p style={{ marginTop: "10px", fontWeight: "600" }}>Zeynep</p>
          </div>

          <div style={{ textAlign: "center" }}>
            <img
              src="/sinan.jpeg"
              alt="Sinan"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <p style={{ marginTop: "10px", fontWeight: "600" }}>Sinan</p>
          </div>

          <div style={{ textAlign: "center" }}>
            <img
              src="/esila.jpeg"
              alt="Esila"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <p style={{ marginTop: "10px", fontWeight: "600" }}>Esila</p>
          </div>
        </div>
      </div>
    </div>
  );
}