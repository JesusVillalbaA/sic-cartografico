const fs = require('fs');
const path = require('path');

const userAntenasData = {
  "type": "FeatureCollection",
  "name": "ANTENAS_Movilnet_Movistar_Digitel",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [
    { "type": "Feature", "properties": { "N": 6, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Central Movilnet", "DIRECCION": "Calle Amador Hernandez, Edif:CANTV, piso 4, Porlamar", "COORDENADAS": "10°57'43.47\"N- 63°50'45.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8460527777778, 10.962075 ] } },
    { "type": "Feature", "properties": { "N": 7, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Porlamar", "DIRECCION": "Calle Milano, Entre calles San Rafael y Amador Hernandez, Porlamar.", "COORDENADAS": "10°57'43.47\"N- 63°50'45.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8460527777778, 10.962075 ] } },
    { "type": "Feature", "properties": { "N": 8, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Palma Real", "DIRECCION": "Parque Nacional Cerro Copey, La Asuncion/ El Valle.", "COORDENADAS": "10°59'51.67\"N-63°54'43.76\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9121555555556, 10.9976861111111 ] } },
    { "type": "Feature", "properties": { "N": 9, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Villa Rosa", "DIRECCION": "Av. Principal de Villa Rosa, Torre de CANTV, Villa Rosa.", "COORDENADAS": "10°57'2.51\"N-63°55'38.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9274416666667, 10.9506972222222 ] } },
    { "type": "Feature", "properties": { "N": 10, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Juan Griego", "DIRECCION": "La Vecindad, Sector el Moro, Barrio el Calvario, detrás del estadio la Vecindad, Juan Griego.", "COORDENADAS": "11° 4'9.11\"N- 63°57'0.31\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9500861111111, 11.0691972222222 ] } },
    { "type": "Feature", "properties": { "N": 11, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Puntas de Piedras", "DIRECCION": "Urb. Las Mercedes, Calle Principal, Entre veredas 16 y 35, Puntas de Piedras.", "COORDENADAS": "10°53'49.47\"N- 64° 5'12.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.0868861111111, 10.8969083333333 ] } },
    { "type": "Feature", "properties": { "N": 12, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Los Cerritos", "DIRECCION": "Av.Principal de Apostadero, Entre los Sectores Agua de Vaca, Guerra y Apostadero, Pampatar.", "COORDENADAS": "11° 1'2.99\"N- 63°49'19.15\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8219861111111, 11.0174972222222 ] } },
    { "type": "Feature", "properties": { "N": 13, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Playa el  Angel", "DIRECCION": "Calle el Carite, Urb. Playa el Angel, Detrás del Centro Comercial AB, Pampatar.", "COORDENADAS": "10°59'8.87\"N-63°49'0.43\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8167861111111, 10.9857972222222 ] } },
    { "type": "Feature", "properties": { "N": 14, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Playa el Agua", "DIRECCION": "Av. 31 de Julio, Sector Playa Parguito, Cerro Cimarron.", "COORDENADAS": "11° 7'27.11\"N-63°50'58.51\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8495861111111, 11.1241972222222 ] } },
    { "type": "Feature", "properties": { "N": 15, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Aeropuerto", "DIRECCION": "Aeropuerto Gral. Santiago Mariño, antenas de CANTV, Sector Playa el Yaque.", "COORDENADAS": "10°55'5.47\"N-63°58'13.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9704972222222, 10.9181861111111 ] } },
    { "type": "Feature", "properties": { "N": 16, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "El Espinal", "DIRECCION": "Via San Juan Bautista, a 300 Mts de cruce con Av. Juan Bautista Arismendi", "COORDENADAS": "10°57'41.47\"N- 63°58'53.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9816083333333, 10.9615194444444 ] } },
    { "type": "Feature", "properties": { "N": 17, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Guinima", "DIRECCION": "Calle PPAL. CANTV Guinima", "COORDENADAS": "10°44'31.23\"N-63°55'30.30\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9250833333333, 10.7420083333333 ] } },
    { "type": "Feature", "properties": { "N": 18, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Juangriego Centro", "DIRECCION": "Calle Los Martires a 50 Mts final de Av. Jesus Rafael Leandro", "COORDENADAS": "11° 5'5.47\"N-63°58'11.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9699416666667, 11.0848527777778 ] } },
    { "type": "Feature", "properties": { "N": 19, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "La Arboleda", "DIRECCION": "Av.Jose Maria Lozada, Urbanizacion Sabanamar, Porlamar.", "COORDENADAS": "10°58'15.44\"N- 63°50'2.31\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.833975, 10.9715111111111 ] } },
    { "type": "Feature", "properties": { "N": 20, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "La Asuncion", "DIRECCION": "Av. 31 de Julio, Sector Las Huertas a 100 mts del crucero de Guacuco.", "COORDENADAS": "11° 1'51.04\"N- 63°51'27.51\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8576416666667, 11.0308444444444 ] } },
    { "type": "Feature", "properties": { "N": 21, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Pampatar", "DIRECCION": "Calle Colinas de la Caranta, Sector la Caranta, Pampatar.", "COORDENADAS": "10°59'52.43\"N-63°47'17.47\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.7881861111111, 10.9978972222222 ] } },
    { "type": "Feature", "properties": { "N": 22, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Punta Horcon", "DIRECCION": "Carretera Boca del Rio/ Boca de Pozo, sector Morro Blanco, Peninsula de Macanao", "COORDENADAS": "10°57'43.47\"N-64°21'4.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.3513305555556, 10.962075 ] } },
    { "type": "Feature", "properties": { "N": 23, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Altagracia", "DIRECCION": "Calle Los Gonzalez, al lado del cementerio", "COORDENADAS": "11° 5'27.47\"N- 63°57'3.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9504972222222, 11.0909638888889 ] } },
    { "type": "Feature", "properties": { "N": 24, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Archpielago Los Testigos", "DIRECCION": "Estacion de guaracostas Los Testigos, isla La Iguana, archipielago Los Testigos", "COORDENADAS": "11°21'26.21\"N-63° 7'57.41\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.1326138888889, 11.3572805555556 ] } },
    { "type": "Feature", "properties": { "N": 25, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Boca de Pozo", "DIRECCION": "Calle Mariño, Antenas de Cantv, Boca de Pozo, Peninsula de Macanao.", "COORDENADAS": "11° 0'24.47\"N- 64°22'48.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.3802194444444, 11.0067972222222 ] } },
    { "type": "Feature", "properties": { "N": 26, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Boca del Rio", "DIRECCION": "Calle 19. CANTV Boca del Rio", "COORDENADAS": "10°58'10.19\"N-64°10'50.83\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.1807861111111, 10.9694972222222 ] } },
    { "type": "Feature", "properties": { "N": 27, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Boulevard Guevara", "DIRECCION": "Res.Alay. Cruce calles Marina y Meneses. Azotea de edificio.", "COORDENADAS": "10°57'3.47\"N-63°51'17.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8549416666667, 10.9509638888889 ] } },
    { "type": "Feature", "properties": { "N": 28, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Conejeros", "DIRECCION": "Sector Conejeros, entre calles Tamanaco y Flores, Porlamar.", "COORDENADAS": "10°57'30.59\"N-63°51'46.75\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8629861111111, 10.9584972222222 ] } },
    { "type": "Feature", "properties": { "N": 29, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "El Guamache", "DIRECCION": "Sector El Guamache", "COORDENADAS": "10°53'37.47\"N- 64° 3'38.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.060775, 10.8937416666667 ] } },
    { "type": "Feature", "properties": { "N": 30, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "El Salado", "DIRECCION": "Calle Flandes. La Fuente", "COORDENADAS": "11° 4'41.47\"N-63°51'27.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8577194444444, 11.0781861111111 ] } },
    { "type": "Feature", "properties": { "N": 31, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "El Valle", "DIRECCION": "Av. Concepcion Mariño a 300 mts semaforo. Sector Toporo", "COORDENADAS": "10°58'22.43\"N- 63°52'8.35\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8689861111111, 10.9728972222222 ] } },
    { "type": "Feature", "properties": { "N": 32, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "El Yaque", "DIRECCION": "Planta Baja, Hotel California. El Yaque", "COORDENADAS": "10°53'53.47\"N- 63°57'40.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9613305555556, 10.8981861111111 ] } },
    { "type": "Feature", "properties": { "N": 33, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Isla Bonita", "DIRECCION": "Carretera Manzanillo-Pedro Gonzalez, sector Isla Bonita - Guayacan, Pedro Gonzalez.", "COORDENADAS": "11° 7'57.71\"N-63°54'54.67\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9151861111111, 11.1326972222222 ] } },
    { "type": "Feature", "properties": { "N": 34, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "La Asuncion II", "DIRECCION": "Sector Cocheima, subiendo hacia tanque de agua (loma)", "COORDENADAS": "11° 2'42.47\"N-63°51'36.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8602194444444, 11.0451305555556 ] } },
    { "type": "Feature", "properties": { "N": 35, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "La Guardia", "DIRECCION": "Calle Nueva, Frente al Grupo Escolar Miguel Zuniaga, La Guardia", "COORDENADAS": "10°59'48.57\"N- 64° 1'8.71\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.0196416666667, 10.996825 ] } },
    { "type": "Feature", "properties": { "N": 36, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Las Hernandez", "DIRECCION": "Av Juan Bautista Arismendi. Las Hernandez", "COORDENADAS": "10°56'26.47\"N-64° 2'34.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.0430194444444, 10.9406861111111 ] } },
    { "type": "Feature", "properties": { "N": 37, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Los Robles", "DIRECCION": "Calle Libertad, Sector Punta Brava, Los Robles, Pampatar.", "COORDENADAS": "10°59'41.27\"N- 63°49'46.87\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8296861111111, 10.9947972222222 ] } },
    { "type": "Feature", "properties": { "N": 38, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Manzanillo", "DIRECCION": "Av. 31 de Julio. Manzanillo", "COORDENADAS": "11° 9'21.27\"N-63°53'17.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.888275, 11.1559083333333 ] } },
    { "type": "Feature", "properties": { "N": 39, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Paraiso", "DIRECCION": "Calle La orquidea. Urb Paraiso. Pampatar", "COORDENADAS": "11° 0'2.47\"N- 63°48'29.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.808275, 11.0006861111111 ] } },
    { "type": "Feature", "properties": { "N": 40, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Playa Guacuco", "DIRECCION": "Playa Guacuco, lateral a residencias Dakota", "COORDENADAS": "11° 2'54.67\"N- 63°48'54.09\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.815025, 11.0485194444444 ] } },
    { "type": "Feature", "properties": { "N": 41, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Porlamar Sur", "DIRECCION": "Calle Igualdad, cruce con calle Diaz, asotea Edif. Gina Morena", "COORDENADAS": "10°57'24.47\"N-63°50'50.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8474416666667, 10.9567972222222 ] } },
    { "type": "Feature", "properties": { "N": 42, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Ranchos de Chana", "DIRECCION": "Sector Guarame.", "COORDENADAS": "11° 4'13.64\"N-63°49'24.60\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8235, 11.0704555555556 ] } },
    { "type": "Feature", "properties": { "N": 43, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "San Antonio", "DIRECCION": "Urb. Doña Elisa, calle El Mangle, sector Macho Muerto", "COORDENADAS": "10°56'38.47\"N- 63°54'14.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9041083333333, 10.9440194444444 ] } },
    { "type": "Feature", "properties": { "N": 44, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "San Francisco de Macanao", "DIRECCION": "Calle principal, al lado de la plaza. San Francisco de Macanao", "COORDENADAS": "11° 2'48.47\"N- 64°17'49.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.2966083333333, 11.0467972222222 ] } },
    { "type": "Feature", "properties": { "N": 45, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "San Juan Bautista", "DIRECCION": "Calle Girardot, sector El Vergel, San Juan Bautista", "COORDENADAS": "11° 1'13.47\"N-63°57'14.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9541083333333, 11.0204083333333 ] } },
    { "type": "Feature", "properties": { "N": 46, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "San Pedro de Coche", "DIRECCION": "", "COORDENADAS": "10°46'55.39\"N- 63°59'38.39\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9939972222222, 10.7820527777778 ] } },
    { "type": "Feature", "properties": { "N": 47, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Santa Ana", "DIRECCION": "", "COORDENADAS": "11° 4'6.47\"N- 63°55'23.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.923275, 11.0684638888889 ] } },
    { "type": "Feature", "properties": { "N": 48, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Santa Maria", "DIRECCION": "Carretera Boca del Rio, sector Santa Maria", "COORDENADAS": "10°57'2.47\"N-64° 5'50.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -64.0974416666667, 10.9506861111111 ] } },
    { "type": "Feature", "properties": { "N": 49, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Tacarigua", "DIRECCION": "Sector El Toporo. Tacarigua", "COORDENADAS": "11° 3'14.47\"N- 63°54'5.79\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.9014972222222, 11.0539638888889 ] } },
    { "type": "Feature", "properties": { "N": 50, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Venetur Margarita", "DIRECCION": "Jardines Hotel Venetur Margarita", "COORDENADAS": "10°58'49.07\"N-63°49'11.16\"O" }, "geometry": { "type": "Point", "coordinates": [ -63.8197666666667, 10.9802972222222 ] } },
    { "type": "Feature", "properties": { "N": 52, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "LA LANGOSTA", "DIRECCION": "Av. Fco. Esteban Gomez. Sector Costa Azul, al lado de la S/E  Morroco de Corpoelec. Municipio mariño. Porlamar.", "COORDENADAS": "Lat 10° 58' 27.33'' / Lon -63° 49' 29.23''" }, "geometry": { "type": "Point", "coordinates": [ -63.8247861111111, 10.9742583333333 ] } },
    { "type": "Feature", "properties": { "N": 53, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "PORLAMAR", "DIRECCION": "Calle Tubores, entre Fermin y Malave, detrás del estacionamiento de Rattan Hypermarket. Municipio Mariño. Porlamar", "COORDENADAS": "Lat 10° 57' 49.46'' / Lon -63° 50' 25.03''" }, "geometry": { "type": "Point", "coordinates": [ -63.8402861111111, 10.9637388888889 ] } },
    { "type": "Feature", "properties": { "N": 54, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "CONEJEROS", "DIRECCION": "Calle Paramaconi. Sector Conejeros, al lado de la Bodega de Nixon. Municipio Mariño. Porlamar", "COORDENADAS": "Lat 10° 57' 44.29'' / Lon  -63° 51' 53.3''" }, "geometry": { "type": "Point", "coordinates": [ -63.8648055555556, 10.9623027777778 ] } },
    { "type": "Feature", "properties": { "N": 55, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Boulevar Guevara", "DIRECCION": "Calle Zamora con Martinez.  Fachada Colonial. Municipio Mariño. Porlamar", "COORDENADAS": "Lat 10° 57' 20.57'' / Lon -63° 51' 7.74''" }, "geometry": { "type": "Point", "coordinates": [ -63.85215, 10.9557138888889 ] } },
    { "type": "Feature", "properties": { "N": 56, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "VILLA ROSA", "DIRECCION": "Av. JBA. Sector Cruz del Pastel al lado de la Ferreteria SEVEN. Municipio Diaz.", "COORDENADAS": "Lat 10° 57' 5.13'' / Lon -63° 56' 23.01''" }, "geometry": { "type": "Point", "coordinates": [ -63.939725, 10.951425 ] } },
    { "type": "Feature", "properties": { "N": 57, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "LOS CERRITOS", "DIRECCION": "Sector Atamo Norte. Cerro El Vigia. Municipio Arismendi", "COORDENADAS": "Lat 11° 1' 6.64'' / Lon -63° 49' 36.26''" }, "geometry": { "type": "Point", "coordinates": [ -63.8267388888889, 11.0185111111111 ] } },
    { "type": "Feature", "properties": { "N": 58, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "CERRO COPEY", "DIRECCION": "Parque nacional Cerro Copey. Sector de Antenas. Municipio Arismendi.", "COORDENADAS": "Lat 10° 59' 51.3\"   / Lon -63° 54' 43,9\"" }, "geometry": { "type": "Point", "coordinates": [ -63.9118611111111, 10.9975833333333 ] } },
    { "type": "Feature", "properties": { "N": 59, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "JUAN GRIEGO", "DIRECCION": "Via Santa Ana, sector La Vecindad. Los Millanes. Municipio Marcano.", "COORDENADAS": "Lat 11° 4' 20.87'' / Lon -63° 56' 53.84''" }, "geometry": { "type": "Point", "coordinates": [ -63.9482888888889, 11.0724638888889 ] } },
    { "type": "Feature", "properties": { "N": 60, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "GUACUCO", "DIRECCION": "Sector Sabana de Guacuco. Via Hotel Caribbean Beach. Municipio Arismendi.", "COORDENADAS": "Lat 11° 3' 2.45''  / Lon -63° 48' 48.75''" }, "geometry": { "type": "Point", "coordinates": [ -63.8135416666667, 11.0506805555556 ] } },
    { "type": "Feature", "properties": { "N": 61, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "PLAYA EL AGUA", "DIRECCION": "Via Playa el Agua. Sector Playa Parguito", "COORDENADAS": "Lat 11° 7' 41.96'' /  Lon -63° 50' 57.11''" }, "geometry": { "type": "Point", "coordinates": [ -63.8491972222222, 11.1283222222222 ] } },
    { "type": "Feature", "properties": { "N": 63, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "La Guardia", "DIRECCION": "Calle Nueva con Arismendi. La guardia, Margarita.", "COORDENADAS": "10°59'48.50''     64 01 10.10''" }, "geometry": { "type": "Point", "coordinates": [ -64.0194722222222, 10.9968055555556 ] } },
    { "type": "Feature", "properties": { "N": 67, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Asunción", "DIRECCION": "Av. 31 de Julio con Las Margaritas. La Asunción.", "COORDENADAS": "11  02  05.2 63  51  21.0''" }, "geometry": { "type": "Point", "coordinates": [ -63.8558333333333, 11.0347777777778 ] } },
    { "type": "Feature", "properties": { "N": 68, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Av 4 de Mayo", "DIRECCION": "Calle Narvaez con Calle Tubores, Edif. San Carlos. Porlamar, Isla de Margarita, Edo. Nueva Esparta, Mun. Mariño.", "COORDENADAS": "10 59 11.00 63 50 35.06''" }, "geometry": { "type": "Point", "coordinates": [ -63.8430722222222, 10.9863888888889 ] } },
    { "type": "Feature", "properties": { "N": 69, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Boca de Pozo", "DIRECCION": "Via Tejerías-Robledal, Sector Boca de Pozo (a 2.5 Km de la población de Robledal). Isla de Margarita, Edo. Nueva Esparta, Mun. Peninsula de Macanao", "COORDENADAS": "11 00 53'' 64 22 36.10''" }, "geometry": { "type": "Point", "coordinates": [ -64.3766944444444, 11.0147222222222 ] } },
    { "type": "Feature", "properties": { "N": 70, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Boca de Rio", "DIRECCION": "Calle Comejen, Urb El hato, Boca del Rio", "COORDENADAS": "10° 58' 38.5'' 64° 10' 39.0''" }, "geometry": { "type": "Point", "coordinates": [ -64.1775, 10.9773611111111 ] } },
    { "type": "Feature", "properties": { "N": 74, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "CC La redoma", "DIRECCION": "CC comercial la redoma de los robles", "COORDENADAS": "10°59'25.69  63°50'19.18''" }, "geometry": { "type": "Point", "coordinates": [ -63.8386611111111, 10.9904694444444 ] } },
    { "type": "Feature", "properties": { "N": 76, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Copey", "DIRECCION": "Sector La Sierra, Cerro Copey, Parroquia Valle del espíritu Santo, Margarita.", "COORDENADAS": "11°  00'  04.3'' 63°  54'  35.2''" }, "geometry": { "type": "Point", "coordinates": [ -63.9097777777778, 11.0011944444444 ] } },
    { "type": "Feature", "properties": { "N": 107, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "Sambil Pta arenas", "DIRECCION": "Centro Comercial Sambil,AV. Jovito Villalba, Pampatar, Margarita.-", "COORDENADAS": "10°  59  44''  63° 48  46''" }, "geometry": { "type": "Point", "coordinates": [ -63.8127777777778, 10.9955555555556 ] } },
    { "type": "Feature", "properties": { "N": 108, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "San Fernando", "DIRECCION": "Ubr Jorge Coll", "COORDENADAS": "11° 0'12.38''  63°49'42.41''" }, "geometry": { "type": "Point", "coordinates": [ -63.8284472222222, 11.0034388888889 ] } },
    { "type": "Feature", "properties": { "N": 109, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "San Francisco Macanao", "DIRECCION": "Sector El Tunal, a 3.5 km de San Francisco de Macanao, Edo. Nueva Esparta, Mun. Peninsula de Macanao", "COORDENADAS": "11° 03 06.4'' 64° 17 06''" }, "geometry": { "type": "Point", "coordinates": [ -64.285, 11.0517777777778 ] } },
    { "type": "Feature", "properties": { "N": 110, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "San Juan Bautista", "DIRECCION": "Sector Boqueron, San Juan Bautista, Isla de Margarita,  Nueva Esparta, Mun. Díaz", "COORDENADAS": "11° 01 25.30'' 63°57 04''" }, "geometry": { "type": "Point", "coordinates": [ -63.9511111111111, 11.0236944444444 ] } },
    { "type": "Feature", "properties": { "N": 111, "REDI": "REDIMAIN", "ZODI": "ZODINE", "ADI": "", "SECTOR": "San Pedro de Coche", "DIRECCION": "Cerro La ermita, al lado de torre Movistar, San Pedro de Coche, Isla de Coche", "COORDENADAS": "10' 46 55.30'' 63' 59 37.80''" }, "geometry": { "type": "Point", "coordinates": [ -63.9938333333333, 10.7820277777778 ] } }
  ]
};

// Separar por Operadora según el rango del dataset original REDIMAIN:
// N: 6 a 50 -> Movilnet
// N: 52 a 61 -> Movistar
// N: 63 a 111 -> Digitel

const movilnetFeatures = [];
const movistarFeatures = [];
const digitelFeatures = [];

userAntenasData.features.forEach(f => {
  const n = f.properties.N;
  let operadora = 'MOVILNET';
  if (n >= 52 && n <= 61) {
    operadora = 'MOVISTAR';
  } else if (n >= 63) {
    operadora = 'DIGITEL';
  }

  const enrichedProps = {
    ...f.properties,
    operadora: operadora,
    OPERADORA: operadora,
    nombre: `Antena ${f.properties.SECTOR}`,
    NAME: `Antena ${f.properties.SECTOR}`,
    tipo: `Radiobase ${operadora}`,
    ubicacion: f.properties.DIRECCION || f.properties.SECTOR
  };

  const enrichedFeature = {
    ...f,
    properties: enrichedProps
  };

  if (operadora === 'MOVILNET') movilnetFeatures.push(enrichedFeature);
  else if (operadora === 'MOVISTAR') movistarFeatures.push(enrichedFeature);
  else digitelFeatures.push(enrichedFeature);
});

const saveJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Guardado ${filePath} con ${data.features.length} registros.`);
};

// Directorios
const publicDirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'sistema-redimain-lite', 'public')
];

publicDirs.forEach(pDir => {
  if (!fs.existsSync(pDir)) return;

  // 1. Guardar ANTENAS.geojson con toda la colección
  const allEnriched = {
    type: "FeatureCollection",
    name: "ANTENAS_Movilnet_Movistar_Digitel",
    features: [...movilnetFeatures, ...movistarFeatures, ...digitelFeatures]
  };
  saveJson(path.join(pDir, 'ANTENAS.geojson'), allEnriched);

  // 2. Guardar movilnet.geojson
  saveJson(path.join(pDir, 'movilnet.geojson'), {
    type: "FeatureCollection",
    name: "ANTENAS_Movilnet",
    features: movilnetFeatures
  });

  // 3. Guardar movistar.geojson
  saveJson(path.join(pDir, 'movistar.geojson'), {
    type: "FeatureCollection",
    name: "ANTENAS_Movistar",
    features: movistarFeatures
  });

  // 4. Guardar digitel.geojson
  saveJson(path.join(pDir, 'digitel.geojson'), {
    type: "FeatureCollection",
    name: "ANTENAS_Digitel",
    features: digitelFeatures
  });
});

console.log("¡Archivos GeoJSON de antenas actualizados exitosamente con los datos auténticos del usuario!");
