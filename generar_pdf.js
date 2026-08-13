const { mdToPdf } = require('md-to-pdf');
const path = require('path');

async function generarPDFEstilizado() {
  console.log('Generando PDF estilizado...');
  
  try {
    const pdf = await mdToPdf(
      { path: 'C:/Users/jesus/Desktop/servidores_sogne.md' },
      {
        dest: 'C:/Users/jesus/Desktop/Reporte_Servidores_SOGNE.pdf',
        // Aquí definimos el estilo (CSS) que se inyectará en el PDF
        css: `
          body { 
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            color: #1f2937; 
            line-height: 1.6;
          }
          h1 { 
            color: #1d4ed8; /* Azul SOGNE */
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 10px; 
            font-size: 28px;
            text-align: center;
          }
          h2 { 
            color: #1e40af; 
            margin-top: 30px; 
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          h3 {
            color: #374151;
            margin-top: 25px;
          }
          p {
            margin-bottom: 15px;
          }
          ul {
            margin-bottom: 20px;
          }
          li { 
            margin-bottom: 8px; 
          }
          strong { 
            color: #111827; 
            font-weight: 600;
          }
          /* Estilo elegante para la tabla comparativa */
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 25px; 
            margin-bottom: 25px;
            font-size: 14px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          th { 
            background-color: #1d4ed8; 
            color: #ffffff; 
            padding: 14px 12px; 
            text-align: left;
            font-weight: bold;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          hr {
            border: 0;
            height: 1px;
            background: #e5e7eb;
            margin: 30px 0;
          }
        `,
        pdf_options: { 
          format: 'A4', 
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
          printBackground: true
        }
      }
    );
    
    console.log('¡Éxito! El PDF ha sido generado en: C:/Users/jesus/Desktop/Reporte_Servidores_SOGNE.pdf');
  } catch (error) {
    console.error('Hubo un error generando el PDF:', error);
  }
}

generarPDFEstilizado();
