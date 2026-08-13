const fs = require('fs');
const path = require('path');

function parseDMS(latStr, lonStr) {
    const parseSingle = (str, isLongitude) => {
        if (!str) return 0;
        str = str.replace(/O/gi, 'W').replace(/’/g, "'").replace(/”/g, '"').trim();
        const regex = /(\d+)[\s°]+(\d+)[\s']+(\d+(?:\.\d+)?)[\s"]*([NnSsEeWw])?/;
        const match = str.match(regex);
        if (match) {
            let deg = parseFloat(match[1]);
            let min = parseFloat(match[2]);
            let sec = parseFloat(match[3]);
            let dir = match[4] ? match[4].toUpperCase() : (isLongitude ? 'W' : 'N');
            let val = deg + min / 60 + sec / 3600;
            if (dir === 'S' || dir === 'W') val = -val;
            return val;
        }
        return 0;
    };
    return [parseSingle(lonStr, true), parseSingle(latStr, false)];
}

// 1. PLANTAS DESALINIZADORAS
const desalinizadoras = [
    { n: 1, name: "Planta Desalinizadora Bahia de Plata", coord: "11° 6'40.24\"N, 63°56'55.40\"O", dir: "Gomez", aporte: "", status: "Operativo", circuito: "" },
    { n: 2, name: "Planta Desalinizadora Boca de Pozo", coord: "10°59'51.21\"N, 64°23'12.96\"O", dir: "Peninsula de Macanao", aporte: "", status: "Operativo", circuito: "" },
    { n: 3, name: "Planta Desalinizadora Boca de Rio", coord: "10°56'52.76\"N, 64°11'19.36\"O", dir: "Peninsula de Macanao", aporte: "", status: "Operativo", circuito: "" },
    { n: 4, name: "Planta Desalinizadora Calle Carabobo", coord: "10°59'26.99\"N, 64° 1'53.03\"O", dir: "Diaz", aporte: "", status: "Operativo", circuito: "" },
    { n: 5, name: "Planta Desalinizadora Chacachacare", coord: "10°57'40.07\"N, 64° 9'38.62\"O", dir: "Peninsula de Macanao", aporte: "", status: "Operativo", circuito: "" },
    { n: 6, name: "Planta Desalinizadora Circulo Militar", coord: "10°59'40.62\"N, 63°48'4.77\"O", dir: "Maneiro", aporte: "", status: "Operativo", circuito: "" },
    { n: 7, name: "Planta Desalinizadora La Uva Coche", coord: "10°47'58.62\"N, 63°56'2.36\"O", dir: "Villalba", aporte: "", status: "Operativo", circuito: "" },
    { n: 8, name: "Planta Desalinizadora Coche Paradise", coord: "10°48'28.08\"N, 63°59'11.89\"O", dir: "Villalba", aporte: "", status: "Operativo", circuito: "" },
    { n: 9, name: "Planta Desalinizadora San Pedro de Coche", coord: "10°47'16.38\"N, 63°59'36.77\"O", dir: "Villalba", aporte: "", status: "Operativo", circuito: "" },
    { n: 10, name: "Planta Desalinizadora Guacuco", coord: "11° 2'53.10\"N, 63°48'45.51\"O", dir: "Arismendi", aporte: "", status: "Operativo", circuito: "" },
    { n: 11, name: "Planta Desalinizadora Guamache", coord: "10°53'50.99\"N, 64° 4'11.79\"O", dir: "Tubores", aporte: "", status: "Operativo", circuito: "" },
    { n: 12, name: "Planta Desalinizadora Guayacancito", coord: "10°56'11.13\"N, 64°12'44.68\"O", dir: "Peninsula de Macanao", aporte: "", status: "Operativo", circuito: "" },
    { n: 13, name: "Planta Desalinizadora Guire Guire", coord: "11° 0'21.00\"N, 64° 1'14.01\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 14, name: "Planta Desalinizadora La Galera", coord: "11° 5'13.05\"N, 63°58'33.78\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 15, name: "Planta Desalinizadora Laguna de Raya", coord: "10°55'28.45\"N, 64° 7'4.67\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 16, name: "Planta Desalinizadora Las Mercedes Punta de Piedra", coord: "10°53'52.88\"N, 64° 5'23.53\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 17, name: "Planta Desalinizadora El Manglillo", coord: "10°57'27.44\"N, 64°19'7.77\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 18, name: "Planta Desalinizadora Playa Cardon", coord: "11° 6'37.40\"N, 63°50'37.46\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 19, name: "Planta Desalinizadora Playa Caribe", coord: "11° 6'36.86\"N, 63°58'7.46\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 20, name: "Planta Desalinizadora Playa el Agua I y II", coord: "11° 8'48.28\"N, 63°51'56.54\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 21, name: "Planta Desalinizadora Pedro Gonzalez", coord: "11° 7'25.51\"N, 63°55'28.61\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 22, name: "Planta Desalinizadora Puerto Real Manzanillo", coord: "11° 9'51.43\"N, 63°52'39.05\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 23, name: "Planta Desalinizadora San Francisco I y II", coord: "11° 3'45.90\"N, 64°16'44.36\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 24, name: "Planta Desalinizadora Taguantar Bicentenario", coord: "11° 4'18.85\"N, 63°59'0.23\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 25, name: "Planta Desalinizadora Venetur I y II", coord: "10°58'41.11\"N, 63°49'5.66\"O", dir: "", aporte: "", status: "Operativo", circuito: "" },
    { n: 26, name: "Planta Desalinizadora El Turpial", coord: "11° 9'1.59\"N, 63°52'52.80\"O", dir: "", aporte: "", status: "Operativo", circuito: "" }
];

// 2. PLANTAS DE TRATAMIENTO
const tratamiento = [
    { n: 1, name: "Planta De Tratamiento Los Cerritos", coord: "11° 0'39.34\"N, 63°49'11.36\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 2, name: "Planta De Tratamiento Los Bagres", coord: "10°56'24.14\"N, 63°56'59.77\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 3, name: "Planta De Tratamiento El Yaque", coord: "10°54'24.42\"N, 63°57'38.35\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 4, name: "Planta De Tratamiento San Pedro De Coche", coord: "10°46'25.93\"N, 63°59'3.81\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 5, name: "Planta De Tratamiento Juan Griego", coord: "11° 5'27.35\"N, 63°58'6.78\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 6, name: "Planta De Tratamiento Aricagua", coord: "11° 7'43.15\"N, 63°51'27.30\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 7, name: "Planta De Tratamiento Punta de Piedra", coord: "10°53'57.76\"N, 64° 4'49.08\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 8, name: "Planta De Tratamiento La Guardia", coord: "10°58'55.70\"N, 64° 1'23.94\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" }
];

// 3. ESTACIONES DE BOMBEO AGUA SERVIDAS
const bombeoServidas = [
    { n: 1, name: "Estación De Bombeo AS La Caranta", coord: "10°59'57.45\"N, 63°47'28.80\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 2, name: "Estación De Bombeo AS Circulo Militar", coord: "10°59'36.97\"N, 63°48'5.02\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 3, name: "Estación De Bombeo AS Nueva Cadiz", coord: "10°59'31.53\"N, 63°48'8.53\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 4, name: "Estación De Bombeo AS Casas Del Sol", coord: "10°59'13.08\"N, 63°48'17.05\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 5, name: "Estación De Bombeo AS La Auyama", coord: "10°58'56.95\"N, 63°49'11.50\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 6, name: "Estación De Bombeo AS Bartolo y Felipa", coord: "10°57'33.94\"N, 63°49'57.56\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 7, name: "Estación De Bombeo AS Guaraguao", coord: "10°57'18.57\"N, 63°50'45.23\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 8, name: "Estación De Bombeo AS Punda", coord: "10°57'0.61\"N, 63°51'18.09\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 9, name: "Estación De Bombeo AS Palosano", coord: "11° 1'38.20\"N, 63°51'9.03\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 10, name: "Estación De Bombeo AS Agua de Vaca", coord: "11° 1'49.12\"N, 63°48'54.38\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 11, name: "Estación De Bombeo AS Catame", coord: "11° 5'19.81\"N, 63°57'36.82\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 12, name: "Estación De Bombeo AS El Consejo", coord: "11° 4'45.57\"N, 63°58'13.23\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 13, name: "Estación De Bombeo AS Giriguire", coord: "11° 5'11.70\"N, 63°58'17.20\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 14, name: "Estación De Bombeo AS Valparaiso", coord: "11° 4'39.35\"N, 63°58'14.85\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 15, name: "Estación De Bombeo AS La Galera", coord: "11° 5'25.39\"N, 63°58'31.71\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 16, name: "Estación De Bombeo AS Principal Punta De Piedras", coord: "10°56'47.00\"N, 64° 6'2.61\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 17, name: "Estación De Bombeo AS Simon Carvajal (Punta Garza)", coord: "10°53'53.00\"N, 64° 5'8.64\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 18, name: "Estación De Bombeo AS Pueblo Nuevo INAVIS", coord: "10°53'57.90\"N, 64° 5'30.17\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 19, name: "Estación De Bombeo AS Guamache", coord: "10°53'49.59\"N, 64° 4'10.96\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 20, name: "Estación De Bombeo AS Porlamar Oeste", coord: "10°56'5.28\"N, 63°54'46.69\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 21, name: "Estación De Bombeo AS Miragua", coord: "11° 8'47.17\"N, 63°51'55.01\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 22, name: "Estación De Bombeo AS Paguito", coord: "11° 7'34.07\"N, 63°50'41.81\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 23, name: "Estación De Bombeo AS Manzanillo", coord: "11° 9'24.00\"N, 63°53'30.56\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 24, name: "Estación De Bombeo AS El Yaque", coord: "10°53'50.56\"N, 63°57'50.01\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 25, name: "Estación De Bombeo AS San Pedro De Coche", coord: "10°46'54.21\"N, 63°59'47.63\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 26, name: "Estación De Bombeo AS La Guardia", coord: "10°59'19.01\"N, 64° 1'43.68\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 27, name: "Estación De Bombeo AS Punta De Mangle", coord: "10°52'42.72\"N, 64° 2'47.66\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 28, name: "Estación De Bombeo AS Capitanía de Puertos", coord: "10°59'48.35\"N, 63°47'8.54\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 29, name: "Estación De Bombeo AS Barrio Moscú-Brisas De Los Ángeles", coord: "11° 3'51.53\"N, 63°57'44.54\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" }
];

// 4. ESTACIONES DE BOMBEO AGUA POTABLE
const bombeoPotable = [
    { n: 1, name: "Estación De Bombeo AP Carujo", coord: "10°58'13.72\"N, 64°11'13.60\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 2, name: "Estación De Bombeo AP Espinal", coord: "10°59'2.99\"N, 63°58'27.92\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 3, name: "Estación De Bombeo AP Paraíso", coord: "10°59'44.77\"N, 63°48'36.35\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 4, name: "Estación De Bombeo AP La Aguada", coord: "10°59'55.35\"N, 63°51'58.33\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 5, name: "Estación De Bombeo AP Manglillo", coord: "10°57'26.54\"N, 64°19'4.31\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 6, name: "Estación De Bombeo AP Zulica Coche", coord: "10°45'18.98\"N, 63°53'23.47\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 7, name: "Estación De Bombeo AP Turpial Manzanillo", coord: "11° 9'0.61\"N, 63°52'53.47\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 8, name: "Estación De Bombeo AP Guayacán", coord: "11° 7'12.64\"N, 63°55'7.45\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 9, name: "Estación De Bombeo AP Pedro González", coord: "11° 5'59.65\"N, 63°56'26.28\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" }
];

// 5. TANQUES DE ALMACENAMIENTO DE AGUA POTABLE
const tanques = [
    { n: 1, name: "Tanque La Restinga", coord: "11° 1'32.80\"N, 64°10'58.87\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 2, name: "Tanque Porlamar", coord: "10°58'43.45\"N, 63°51'30.87\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 3, name: "Tanque Guacuco", coord: "11° 2'40.31\"N, 63°49'11.30\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 4, name: "Tanque Manzanillo Turpial", coord: "11° 9'24.18\"N, 63°53'13.48\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 5, name: "Tanque La Pista", coord: "11° 1'54.86\"N, 63°57'12.13\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 6, name: "Tanque Manglillo", coord: "10°57'26.94\"N, 64°19'4.21\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 7, name: "Tanque San Francisco", coord: "11° 1'13.95\"N, 64°17'31.55\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 8, name: "Tanque Carujo", coord: "10°58'13.95\"N, 64°11'13.00\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 9, name: "Tanque La Udo", coord: "10°58'5.89\"N, 64°10'35.75\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 10, name: "Tanque Asunción", coord: "11° 1'42.41\"N, 63°52'35.68\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 11, name: "Tanque Pedro González", coord: "11° 6'58.49\"N, 63°55'7.76\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 12, name: "Tanque La Isleta", coord: "10°53'21.77\"N, 63°53'57.77\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 13, name: "Tanque Copey", coord: "11° 1'44.46\"N, 63°52'58.98\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 14, name: "Tanque Guayacán", coord: "11° 7'12.81\"N, 63°55'7.77\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 15, name: "Tanque Tacarigua", coord: "11° 2'51.31\"N, 63°53'17.38\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 16, name: "Tanque Boca De Pozo", coord: "10°59'56.53\"N, 64°22'2.98\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 17, name: "Tanque Paraíso", coord: "11° 0'18.93\"N, 63°48'45.73\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 18, name: "Tanque Salamanca", coord: "11° 3'18.64\"N, 63°51'27.35\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 19, name: "Tanque El Espinal", coord: "10°58'17.98\"N, 63°58'14.12\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 20, name: "Tanque Las Hernández", coord: "10°55'51.27\"N, 64° 3'33.58\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 21, name: "Tanque Las Piedras Del Valle", coord: "10°59'25.48\"N, 63°53'23.15\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 22, name: "Tanque Jorge Coll", coord: "11° 0'22.63\"N, 63°49'23.80\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 23, name: "Tanque La Guardia", coord: "10°58'50.45\"N, 64° 0'2.01\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 24, name: "Tanque La Rinconada", coord: "11° 5'36.77\"N, 63°53'20.12\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 25, name: "Tanque Pedregales", coord: "11° 3'27.48\"N, 63°58'13.83\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 26, name: "Tanque Guayacancito", coord: "10°56'7.52\"N, 64°12'28.20\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 27, name: "Tanque Zulica Coche", coord: "10°45'26.88\"N, 63°54'34.81\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 28, name: "Tanque Seneca Coche", coord: "10°46'33.54\"N, 63°59'16.98\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 29, name: "Tanque Los Morochos I y II", coord: "10°47'17.83\"N, 63°58'59.01\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" },
    { n: 30, name: "Tanque Puerto Real", coord: "11° 9'53.58\"N, 63°52'51.03\"O", dir: "", capacidad: "", status: "Operativo", circuito: "" }
];

// 6. DIQUES
const diques = [
    { n: 1, name: "Dique San Juan", coord: "11° 1'17.50\"N, 63°56'16.45\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 2, name: "Dique Guatamare", coord: "10°58'49.16\"N, 63°52'34.38\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 3, name: "Dique Pololo", coord: "10°58'37.69\"N, 63°54'50.32\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 4, name: "Dique Asunción", coord: "11° 1'39.52\"N, 63°52'10.53\"O", dir: "", aporte: "", capacidad: "", circuito: "" }
];

// 7. POZOS AGUA POTABLE
const pozos = [
    { n: 1, name: "Pozo INTI Estancia/Parcela #34", coord: "11° 5'47.73\"N, 63°52'18.08\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 2, name: "Pozo Las Minas", coord: "11° 5'59.27\"N, 63°52'23.85\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 3, name: "Pozo INTI Estancia/Parcela #17", coord: "11° 5'39.89\"N, 63°52'50.72\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 4, name: "Pozo El Coco De Aricagua", coord: "11° 7'42.61\"N, 63°52'52.84\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 5, name: "Pozo Las Minas #5", coord: "11° 5'57.28\"N, 63°52'23.94\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 6, name: "Pozo Los Molinos", coord: "11° 7'33.95\"N, 63°51'45.04\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 7, name: "Pozo El Toco #2", coord: "11° 7'16.99\"N, 63°52'6.74\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 8, name: "Pozo La Rinconada1 #4", coord: "11° 5'37.90\"N, 63°52'50.72\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 9, name: "Pozo La Rinconada Parcela #28", coord: "11° 5'48.17\"N, 63°52'23.79\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 10, name: "Pozo Comunidad Tres Molinos", coord: "11° 4'17.41\"N, 63°55'16.78\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 11, name: "Pozo Cerro La Cruz #1", coord: "11° 4'18.91\"N, 63°55'17.57\"O", dir: "", aporte: "", capacidad: "", circuito: "" },
    { n: 12, name: "Pozo Mat", coord: "11° 3'5.65\"N, 63°51'29.06\"O", dir: "", aporte: "", capacidad: "", circuito: "" }
];

// 8. ESTACIONES DE CLORADO
const clorado = [
    { n: 1, name: "Estación de Clorado Los Argodones", coord: "10°52'31.83\"N, 64° 2'17.81\"O", dir: "", aporte: "", capacidad: "", circuito: "2 Juan B" },
    { n: 2, name: "Estación de Clorado Punta Mozquito", coord: "10°53'38.75\"N, 63°53'19.81\"O", dir: "", aporte: "", capacidad: "", circuito: "8 Luisa C" }
];

function buildFeatures(arr, category, subcat) {
    return arr.map((item, idx) => {
        const parts = item.coord.split(',');
        const [lon, lat] = parseDMS(parts[0], parts[1]);
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lon, lat]
            },
            properties: {
                id: `agua_${category.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
                name: item.name,
                NAME: item.name,
                tipo: category,
                subcategoria: subcat,
                municipio: item.dir || "Nueva Esparta",
                address: item.dir || "",
                status: item.status || "Operativo",
                institution: "HIDROCARIBE / MPSA",
                circuito: item.circuito || "",
                aporte: item.aporte || "",
                capacidad: item.capacidad || ""
            }
        };
    });
}

const allFeatures = [
    ...buildFeatures(desalinizadoras, "Planta Desalinizadora", "desalinizadoras"),
    ...buildFeatures(tratamiento, "Planta de Tratamiento", "tratamiento"),
    ...buildFeatures(bombeoServidas, "Estación de Bombeo Aguas Servidas", "bombeoServidas"),
    ...buildFeatures(bombeoPotable, "Estación de Bombeo Agua Potable", "bombeoPotable"),
    ...buildFeatures(tanques, "Tanque de Almacenamiento", "tanques"),
    ...buildFeatures(diques, "Dique Toma", "diques"),
    ...buildFeatures(pozos, "Pozo de Agua Potable", "pozos"),
    ...buildFeatures(clorado, "Estación de Clorado", "clorado")
];

const fc = {
    type: "FeatureCollection",
    features: allFeatures
};

const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'estacionagua.geojson'), JSON.stringify(fc, null, 2));
fs.writeFileSync(path.join(publicDir, 'EmbalsesNE.geojson'), JSON.stringify(fc, null, 2));
fs.writeFileSync(path.join(publicDir, 'hidrologia.geojson'), JSON.stringify(fc, null, 2));

console.log(`✅ ¡Se importaron ${allFeatures.length} instalaciones de servicio de agua completamente funcionales!`);
