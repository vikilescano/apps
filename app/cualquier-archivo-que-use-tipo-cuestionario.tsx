// Si hay código que intenta acceder a respuesta.tipo_cuestionario, modificarlo para que no falle
// Por ejemplo, cambiar:
const tipo = respuesta.tipo_cuestionario

// Por:
const tipo = respuesta.tipo_cuestionario || "cronotipo"

// O simplemente eliminar el código que usa tipo_cuestionario si no es necesario
