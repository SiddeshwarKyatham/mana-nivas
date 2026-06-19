import { useEffect } from 'react';

/**
 * Custom React hook to dynamically manage dynamic document metadata (Titles, Descriptions)
 * for maximum performance and professional SEO standards.
 */
export const useDocumentMetadata = (title: string, description?: string) => {
  useEffect(() => {
    // Dynamic Title Management
    document.title = `${title} | Mana Nivas`;
    
    // Dynamic Description Meta Tag Management
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    
    const fallbackDesc = 'Mana Nivas - A premium luxury hotel experience offering ultimate peace, custom heritage suites, local gourmet culinary, and high-end guest booking services.';
    metaDescription.setAttribute('content', description || fallbackDesc);
  }, [title, description]);
};
