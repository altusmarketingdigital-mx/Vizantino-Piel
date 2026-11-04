-- ==============================================================================
-- ACTUALIZACIÓN DE URLs DE IMÁGENES A HOSTING ACTIVO 200 OK (VIZANTINO PIEL)
-- ==============================================================================
-- Reemplaza la ruta 'vizantinopiel.com/products/' por 'vizantino.com/products/'
-- donde se encuentran alojadas físicamente todas las fotografías oficiales en alta resolución.

UPDATE public.products
SET image = REPLACE(image, 'https://vizantinopiel.com/products/', 'https://vizantino.com/products/')
WHERE image LIKE '%vizantinopiel.com/products/%';

UPDATE public.products
SET image = REPLACE(image, 'http://vizantinopiel.com/products/', 'https://vizantino.com/products/')
WHERE image LIKE '%http://vizantinopiel.com/products/%';

-- Comprobación: Contar cuántos productos quedaron actualizados correctamente
SELECT id, name, category, image 
FROM public.products 
WHERE image LIKE '%vizantino.com/products/%'
ORDER BY id ASC;
