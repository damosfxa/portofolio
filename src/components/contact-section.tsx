"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function ContactSection() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(e.currentTarget);
    const object = Object.fromEntries(formData);
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

    if (!accessKey) {
      alert("Web3Forms access key is missing! Please configure NEXT_PUBLIC_WEB3FORMS_KEY in your .env.local file.");
      setStatus("idle");
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: object.name,
          email: object.email,
          message: object.message,
          subject: `New Portfolio Message from ${object.name}`,
          from_name: "Rizky Rhamadani Portfolio",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("success");
      } else {
        alert("Failed to send message: " + result.message);
        setStatus("idle");
      }
    } catch (error) {
      alert("Something went wrong! Please try again later.");
      setStatus("idle");
    }
  };

  return (
    <section id="contact" className="py-32 px-6 max-w-4xl mx-auto w-full scroll-mt-16">
      <div className="flex flex-col md:flex-row gap-16 md:gap-10">
        
        {/* Left Col */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col gap-6"
        >
          <div className="h-[80px] md:h-[100px]">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground">
              {t("contact.title")} <span className="font-bold text-violet-500">{t("contact.highlight")}</span>
            </h2>
          </div>
          
          <p className="text-sm md:text-base text-text-muted max-w-md leading-relaxed h-[80px]">
            {t("contact.desc")}
          </p>

          <div className="flex flex-col gap-5 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-border bg-surface flex items-center justify-center text-foreground rounded-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Email</p>
                <a href="mailto:ryzkirham@gmail.com" className="text-sm font-medium text-foreground hover:underline underline-offset-4 transition-all">
                  ryzkirham@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-border bg-surface flex items-center justify-center text-foreground rounded-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">{t("contact.locationTitle")}</p>
                <p className="text-sm font-medium text-foreground">
                  {t("contact.locationValue")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Col */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <div className="bg-surface border border-border p-8 rounded-sm shadow-sm relative overflow-hidden">
            
            {status === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-surface flex flex-col items-center justify-center text-center p-8 z-10"
              >
                <div className="w-12 h-12 border border-foreground text-foreground rounded-sm flex items-center justify-center mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{t("contact.sent")}</h4>
                <p className="text-sm text-text-muted">{t("contact.sentDesc")}</p>
                <button onClick={() => setStatus("idle")} className="mt-6 text-sm text-foreground font-semibold hover:underline underline-offset-4">
                  {t("contact.sendAnother")}
                </button>
              </motion.div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-0">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t("contact.name")}</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  required 
                  className="w-full bg-muted border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all placeholder:text-text-subtle"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t("contact.email")}</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required 
                  className="w-full bg-muted border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all placeholder:text-text-subtle"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t("contact.message")}</label>
                <textarea 
                  id="message" 
                  name="message"
                  required 
                  rows={4}
                  className="w-full bg-muted border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all resize-none placeholder:text-text-subtle"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded-sm font-semibold text-sm hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {status === "submitting" ? (
                  <span className="animate-pulse">{t("contact.sending")}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t("contact.send")}
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
