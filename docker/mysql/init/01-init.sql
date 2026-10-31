-- Se ejecuta una sola vez, al crear el volumen de datos por primera vez.
-- La imagen de MySQL lo corre contra la base definida en MYSQL_DATABASE.
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
