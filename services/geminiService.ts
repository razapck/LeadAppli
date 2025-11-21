import { GoogleGenAI } from "@google/genai";
import { GroundingSource, ParsedLead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchLeads = async (
  industry: string,
  location: string,
  details: string,
  minLeads: number = 5,
  maxLeads: number = 10
): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    // Construction d'un prompt optimisé
    const prompt = `
      Agis comme un expert en prospection commerciale (Sales Development Representative).
      
      Tâche : Trouve des leads potentiels pour l'industrie "${industry}" situés à "${location}".
      Détails supplémentaires : ${details}

      Objectif de quantité : Trouve entre ${minLeads} et ${maxLeads} entreprises pertinentes.

      Critères de recherche :
      1. Priorise les entreprises qui ont un site web actif.
      2. Cherche activement les emails de contact (info@, contact@, etc.) et les numéros de téléphone locaux.
      3. Évalue la pertinence de l'entreprise par rapport à la demande "${industry}".

      Format de réponse OBLIGATOIRE :
      Je veux que tu listes les entreprises trouvées. Pour chaque entreprise, utilise exactement ce format avec les séparateurs "###" :

      ###
      Nom: [Nom de l'entreprise]
      Site: [URL du site web ou "Non trouvé"]
      Email: [Adresse email ou "Non trouvé"]
      Téléphone: [Numéro de téléphone ou "Non trouvé"]
      Activité: [Activité principale précise de l'entreprise, ex: "Agence SEO", "Plomberie", etc.]
      Pertinence: [Note de 0 à 50 évaluant UNIQUEMENT si l'entreprise correspond au secteur et à la ville demandés]
      ###

      Assure-toi que les informations sont basées sur les résultats de recherche Google.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Aucun résultat textuel généré.";
    
    // Extraction des sources de grounding (liens web)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title,
      }));

    return { text, sources };

  } catch (error) {
    console.error("Erreur lors de la recherche de leads:", error);
    throw error;
  }
};

// Fonction utilitaire pour parser le texte semi-structuré en objets
export const parseLeadsFromText = (text: string): ParsedLead[] => {
  const leads: ParsedLead[] = [];
  const blocks = text.split('###').filter(b => b.trim().length > 10); // Filtrer les blocs vides

  blocks.forEach((block, index) => {
    const nameMatch = block.match(/Nom:\s*(.+)/);
    const siteMatch = block.match(/Site:\s*(.+)/);
    const emailMatch = block.match(/Email:\s*(.+)/);
    const phoneMatch = block.match(/Téléphone:\s*(.+)/);
    // On cherche "Activité" en priorité, sinon "Description" pour la rétrocompatibilité
    const activityMatch = block.match(/Activité:\s*(.+)/) || block.match(/Description:\s*(.+)/);
    // On récupère la pertinence sémantique (0-50) donnée par l'IA
    const relevanceMatch = block.match(/Pertinence:\s*(\d+)/) || block.match(/Score:\s*(\d+)/);

    if (nameMatch) {
      const rawEmail = emailMatch ? emailMatch[1].trim() : "";
      const rawPhone = phoneMatch ? phoneMatch[1].trim() : "";
      const rawSite = siteMatch ? siteMatch[1].trim() : "";

      // Nettoyage des données : Si contient "Non trouvé", on met undefined
      const email = !rawEmail.toLowerCase().includes("non trouvé") && rawEmail.length > 3 ? rawEmail : undefined;
      const phone = !rawPhone.toLowerCase().includes("non trouvé") && rawPhone.length > 3 ? rawPhone : undefined;
      const website = !rawSite.toLowerCase().includes("non trouvé") && rawSite.length > 3 ? rawSite : undefined;

      // --- ALGORITHME DE CALCUL DU SCORE ---
      // 1. Base: Pertinence sémantique (IA) -> Max 50 points
      let aiScore = relevanceMatch ? parseInt(relevanceMatch[1], 10) : 25;
      // Clamp aiScore au cas où l'IA hallucine un nombre > 50
      if (aiScore > 50) aiScore = 50; 

      // 2. Bonus: Qualité des données -> Max 50 points
      let dataScore = 0;
      if (website) dataScore += 10;
      if (phone) dataScore += 15;
      if (email) dataScore += 25;

      const finalScore = aiScore + dataScore;

      leads.push({
        id: `lead-${index}-${Date.now()}`,
        name: nameMatch[1].trim(),
        website: website,
        email: email,
        phone: phone,
        contactInfo: [email, phone].filter(Boolean).join(" | "),
        // On stocke l'activité dans le champ 'description' du modèle interne
        description: activityMatch ? activityMatch[1].trim() : "Activité non spécifiée",
        potentialScore: finalScore,
      });
    }
  });

  // Tri des leads par score décroissant
  return leads.sort((a, b) => b.potentialScore - a.potentialScore);
};