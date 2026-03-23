
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto space-y-8 animate-fade py-10">
      <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Privacy <span className="text-red-600">Policy</span></h2>
      <div className="glass p-8 md:p-12 rounded-[2.5rem] space-y-8 text-slate-400 text-sm leading-relaxed overflow-y-auto max-h-[70vh] custom-scrollbar">
        <div className="space-y-4">
          <p className="font-bold text-white">Ultimo aggiornamento: 23 Marzo 2026</p>
          <p>La presente Privacy Policy descrive come vengono raccolti, utilizzati e protetti i tuoi dati personali quando utilizzi il nostro portale.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-widest text-xs border-l-2 border-red-600 pl-3">1. Titolare del Trattamento</h3>
          <p>Il trattamento dei dati è gestito dall'amministratore del portale "YouTube Smart Archive" per il canale Karaoke Italiano. Per qualsiasi richiesta relativa alla privacy, puoi contattarci tramite il modulo nella sezione "Richiedi".</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-widest text-xs border-l-2 border-red-600 pl-3">2. Dati Raccolti</h3>
          <p>Raccogliamo i seguenti tipi di informazioni:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Dati forniti volontariamente:</strong> Nome ed email inviati tramite il modulo di richiesta brani.</li>
            <li><strong>Dati di navigazione:</strong> Indirizzo IP, tipo di browser, tempi di accesso e pagine visitate (raccolti automaticamente).</li>
            <li><strong>Dati da Terze Parti:</strong> Utilizziamo le API di YouTube. YouTube può raccogliere dati secondo la propria <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Privacy Policy di Google</a>.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-widest text-xs border-l-2 border-red-600 pl-3">3. Finalità del Trattamento</h3>
          <p>I dati sono trattati per:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Fornire e gestire il servizio di archivio video.</li>
            <li>Rispondere alle richieste di nuovi brani inviate dagli utenti.</li>
            <li>Migliorare l'esperienza utente e analizzare l'utilizzo del sito.</li>
            <li>Garantire la sicurezza del portale.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-widest text-xs border-l-2 border-red-600 pl-3">4. Base Giuridica</h3>
          <p>Trattiamo i tuoi dati sulla base del tuo consenso (per l'invio dei moduli) e del nostro legittimo interesse a fornire un servizio funzionale e sicuro.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-widest text-xs border-l-2 border-red-600 pl-3">5. Servizi di Terze Parti</h3>
          <p>Il portale integra servizi esterni:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>YouTube API Services:</strong> Utilizzati per visualizzare i video. Utilizzando questo sito, accetti di essere vincolato dai <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Termini di Servizio di YouTube</a>.</li>
            <li><strong>Formspree:</strong> Utilizzato per la gestione dei messaggi di contatto.</li>
            <li><strong>Google Fonts:</strong> Per la visualizzazione dei caratteri tipografici.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-widest text-xs border-l-2 border-red-600 pl-3">6. I Tuoi Diritti (GDPR)</h3>
          <p>In conformità con il Regolamento UE 2016/679 (GDPR), hai il diritto di:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Accedere ai tuoi dati personali.</li>
            <li>Chiedere la rettifica o la cancellazione dei dati.</li>
            <li>Opporsi al trattamento o chiederne la limitazione.</li>
            <li>Richiedere la portabilità dei dati.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-widest text-xs border-l-2 border-red-600 pl-3">7. Sicurezza</h3>
          <p>Adottiamo misure di sicurezza tecniche e organizzative adeguate per proteggere i tuoi dati da accessi non autorizzati, alterazioni o distruzioni.</p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
