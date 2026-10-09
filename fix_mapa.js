const fs = require('fs');
let code = fs.readFileSync('c:/Users/jesus/sic-sistema-cartografico/components/map/MapaCentral.tsx', 'utf8');

// Eliminar imports
code = code.replace(/import \{ ModalDiagramaElectrico \} from '\.\/ModalDiagramaElectrico';\r?\n/, '');
code = code.replace(/import \{ ModalDiagramaGas \} from '\.\/ModalDiagramaGas';\r?\n/, '');
code = code.replace(/import \{ AsistenteIA \} from '\.\/AsistenteIA';\r?\n/, '');

// Eliminar estados
code = code.replace(/\s*const \[isDiagramaOpen, setIsDiagramaOpen\] = useState\(false\);\r?\n/, '');
code = code.replace(/\s*const \[isDiagramaGasOpen, setIsDiagramaGasOpen\] = useState\(false\);\r?\n/, '');

// Eliminar setIsDiagramaOpen(false) 
code = code.replace(/\s*setIsDiagramaOpen\(false\);\r?\n/, '');
code = code.replace(/\s*setIsDiagramaGasOpen\(false\);\r?\n/, '');

// Eliminar botones (que estn en un div contenedor de "Botones de Acceso Flotante")
// The entire div 'Botones de Acceso Flotante' is exactly for these diagrams. If I delete the div, I delete the buttons.
// Let's remove the whole 'Botones de Acceso Flotante' block until its closing div.
code = code.replace(/\{\/\* Botones de Acceso Flotante Condicionados.*?\*\/\}\r?\n\s*<div className="absolute top-24 left-6 z-30 flex flex-col gap-2">[\s\S]*?<\/div>/, '');

// Eliminar componentes renderizados
code = code.replace(/\s*<AsistenteIA[\s\S]*?\/>\r?\n/, '');
code = code.replace(/\s*<ModalDiagramaElectrico[\s\S]*?\/>\r?\n/, '');
code = code.replace(/\s*<ModalDiagramaGas[\s\S]*?\/>\r?\n/, '');

// Eliminar props a AnalysisPanel
code = code.replace(/\s*onOpenDiagrama=\{.*?\}/, '');
code = code.replace(/\s*onOpenDiagramaGas=\{.*?\}/, '');

fs.writeFileSync('c:/Users/jesus/sic-sistema-cartografico/components/map/MapaCentral.tsx', code, 'utf8');
