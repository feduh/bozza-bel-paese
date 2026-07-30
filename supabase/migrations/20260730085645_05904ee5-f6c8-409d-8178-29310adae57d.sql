DO $$
DECLARE ed uuid; curator uuid := '28bc4cae-dca8-469b-b6d0-7803921e40dc'; cname text;
  decl jsonb := '{"original_work": true, "has_permissions": true, "notes": "Articolo editoriale interno"}'::jsonb;
BEGIN
  SELECT display_name INTO cname FROM public.profiles WHERE user_id = curator;
  IF NOT EXISTS (SELECT 1 FROM public.editorial_editions WHERE year = 2025) THEN
    INSERT INTO public.editorial_editions (year, title, theme_description, status, curator_user_id)
    VALUES (2025, 'Abitare il margine',
      'L''edizione 2025 ha attraversato i luoghi ai bordi delle città: capannoni riconvertiti, case del popolo, teatri di quartiere. Un percorso di lettura su come la pratica artistica trasforma spazi dimenticati in infrastrutture culturali condivise.',
      'published', curator)
    RETURNING id INTO ed;

    INSERT INTO public.blog_posts (title, excerpt, content, author_name, category, user_id, slug, status, published_at, editorial_edition_id, copyright_check_status, copyright_declaration)
    VALUES
    ('La periferia come laboratorio', 'Tre esperienze di rigenerazione culturale nate fuori dai centri storici, tra Torino, Bari e Sesto San Giovanni.',
     E'Nelle aree periferiche la pratica artistica assume una funzione diversa: non decora, ma tiene insieme.\n\nDa Torino a Bari, i collettivi che abbiamo incontrato lavorano su tempi lunghi, con budget minimi e una relazione costante con il vicinato.', coalesce(cname,'Autore Editor'), 'Editoriali', curator, 'la-periferia-come-laboratorio-2025', 'published', '2025-04-12', ed, 'ok', decl),
    ('Capannoni, e poi?', 'Cosa succede quando un''ex area industriale diventa spazio culturale: usi temporanei, comodati, conflitti.',
     E'Il capannone è l''architettura più contesa del decennio.\n\nTra usi temporanei e comodati d''uso, raccontiamo le forme giuridiche che rendono possibile — o impossibile — la permanenza.', coalesce(cname,'Autore Editor'), 'Editoriali', curator, 'capannoni-e-poi-2025', 'published', '2025-06-03', ed, 'ok', decl),
    ('Il pubblico che manca', 'Costruire comunità dove non c''è un bacino: strategie di prossimità nei territori a bassa densità.',
     E'Non esiste pubblico da conquistare: esiste un vicinato da ascoltare.\n\nUn''indagine sulle pratiche di prossimità in Appennino e nelle aree interne del Sud.', coalesce(cname,'Autore Editor'), 'Editoriali', curator, 'il-pubblico-che-manca-2025', 'published', '2025-09-21', ed, 'ok', decl);
  END IF;
END $$;