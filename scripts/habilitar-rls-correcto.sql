-- Habilitar RLS en la tabla respuestas_cronotipo (la tabla correcta según el esquema)
ALTER TABLE respuestas_cronotipo ENABLE ROW LEVEL SECURITY;

-- Crear una política que permita a los usuarios autenticados insertar datos
CREATE POLICY "Permitir inserciones a usuarios autenticados" 
ON respuestas_cronotipo 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Crear una política que permita a los usuarios anónimos insertar datos
CREATE POLICY "Permitir inserciones anónimas" 
ON respuestas_cronotipo 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Crear una política que permita a los usuarios autenticados leer todos los datos
CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON respuestas_cronotipo 
FOR SELECT 
TO authenticated 
USING (true);

-- Crear una política que permita al servicio leer y modificar todos los datos
CREATE POLICY "Permitir todas las operaciones al servicio" 
ON respuestas_cronotipo 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
