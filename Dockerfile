# Imagen base
FROM node:lts-alpine3.19
# Se define el directorio de trabajo
WORKDIR /app
# Copia el archivo al directorio de trabajo
COPY app.js ./
# Comando para ejecutar la aplicación
CMD [ "node", "app.js" ]

# Comado para correr la imagen en el contenedor:
# docker container run --interactive --tty <image>:<tag> 