// DentaCare Pro — Datos Mock para la Fase 1 de la PWA de Clínica Dental

window.INITIAL_MOCK_DATA = {
  clinicInfo: {
    name: "DentaCare Pro — Clínica Odontológica Integral",
    ruc: "20608945123",
    address: "Av. Primavera 1450, Of. 302 — Surco, Lima",
    phone: "+51 (01) 480-9210",
    whatsapp: "+51 987 654 321",
    currency: "$",
    phase: "Fase 1 — MVP Operativo & Clínico (PWA)"
  },

  requirementsPhase1: [
    {
      code: "RF-01",
      module: "Arquitectura PWA & Offline-First",
      title: "Instalabilidad, Service Worker y Cola de Sincronización Offline",
      description: "Funcionamiento como Progressive Web App con manifest.json, caché de activos y almacenamiento local con cola de sincronización ante cortes de internet.",
      status: "Cubierto"
    },
    {
      code: "RF-02",
      module: "Gestión de Agenda & Sillones",
      title: "Programación Multiconsultorio y Flujo de Sala de Espera",
      description: "Control de citas por odontólogo y consultorio/sillón, estados en tiempo real (Pendiente, Confirmada, En Sala, En Sillón, Atendida) y recordatorios.",
      status: "Cubierto"
    },
    {
      code: "RF-03",
      module: "Historia Clínica Electrónica (HCE)",
      title: "Filiación, Alertas Médicas Críticas, Anamnesis y Evoluciones SOAP",
      description: "Ficha integral del paciente con alertas visibles (alergias, hipertensión, anticoagulantes), notas de evolución por sesión y visor radiográfico.",
      status: "Cubierto"
    },
    {
      code: "RF-04",
      module: "Odontograma Digital FDI",
      title: "Odontograma Interactivo por Superficie (5 Caras) y Pieza Completa",
      description: "Mapa dental adulto (32 piezas) y pediátrico (20 piezas) con registro visual de caries, restauraciones, endodoncias, coronas, implantes y ausencias.",
      status: "Cubierto"
    },
    {
      code: "RF-05",
      module: "Presupuestos, Tratamientos y Caja",
      title: "Planes de Tratamiento Vinculados, Aranceles y Control de Abonos",
      description: "Generación de presupuestos desde el catálogo o el odontograma, seguimiento por etapa y registro de pagos parciales o totales.",
      status: "Cubierto"
    },
    {
      code: "RF-06",
      module: "Portal del Paciente (Autogestión PWA)",
      title: "Reserva de Citas Móvil, Carné QR y Seguimiento de Tratamiento",
      description: "Interfaz móvil para que el paciente reserve o reprograme citas en 3 pasos, realice check-in con QR y revise sus pagos e indicaciones.",
      status: "Cubierto"
    }
  ],

  dentists: [
    {
      id: "DOC-01",
      name: "Dra. Valeria Mendoza Salazar",
      specialty: "Rehabilitación Oral y Estética Dental",
      cmp: "COP 34812",
      chair: "Consultorio 1 (Sillón Principal)",
      color: "teal",
      avatar: "VM",
      phone: "+51 991 234 567",
      availability: "Lun - Sáb (08:30 - 19:00)"
    },
    {
      id: "DOC-02",
      name: "Dr. Carlos Eduardo Paredes",
      specialty: "Endodoncia y Microcirugía Apical",
      cmp: "COP 29540",
      chair: "Consultorio 2 (Endo & Rx)",
      color: "sky",
      avatar: "CP",
      phone: "+51 992 845 110",
      availability: "Lun - Vie (09:00 - 18:00)"
    },
    {
      id: "DOC-03",
      name: "Dra. Sofía Ríos Alarcón",
      specialty: "Ortodoncia Digital y Ortopedia Maxilar",
      cmp: "COP 41029",
      chair: "Consultorio 3 (Ortodoncia)",
      color: "indigo",
      avatar: "SR",
      phone: "+51 984 112 908",
      availability: "Mar - Sáb (10:00 - 20:00)"
    },
    {
      id: "DOC-04",
      name: "Dr. Martín Aguirre Vega",
      specialty: "Implantología y Cirugía Bucal",
      cmp: "COP 26780",
      chair: "Consultorio 1 (Quirófano Menor)",
      color: "emerald",
      avatar: "MA",
      phone: "+51 998 711 402",
      availability: "Lun - Sáb (08:00 - 16:00)"
    }
  ],

  catalog: [
    { id: "SRV-01", code: "PRV-101", name: "Consulta y Evaluación Integral + Diagnóstico Digital", category: "Preventiva", duration: 30, price: 80 },
    { id: "SRV-02", code: "PRV-102", name: "Profilaxis Ultrasónica + Destartraje + Fluorización", category: "Preventiva", duration: 45, price: 150 },
    { id: "SRV-03", code: "OPE-201", name: "Restauración Fotopolimerizable con Resina Simple (1 cara)", category: "Operatoria", duration: 40, price: 140 },
    { id: "SRV-04", code: "OPE-202", name: "Restauración con Resina Compuesta Compleja (2-3 caras)", category: "Operatoria", duration: 60, price: 210 },
    { id: "SRV-05", code: "END-301", name: "Endodoncia Mecanizada Unirradicular (Incisivo/Canino)", category: "Endodoncia", duration: 60, price: 420 },
    { id: "SRV-06", code: "END-302", name: "Endodoncia Mecanizada Multirradicular (Premolar/Molar)", category: "Endodoncia", duration: 90, price: 650 },
    { id: "SRV-07", code: "REH-401", name: "Corona Libre de Metal en Zirconio / Disilicato E.max", category: "Rehabilitación", duration: 60, price: 1150 },
    { id: "SRV-08", code: "REH-402", name: "Incrustación Dental Indirecta (Inlay / Onlay Cerámico)", category: "Rehabilitación", duration: 60, price: 780 },
    { id: "SRV-09", code: "CIR-501", name: "Exodoncia Simple Atraumática", category: "Cirugía", duration: 40, price: 180 },
    { id: "SRV-10", code: "CIR-502", name: "Cirugía de Tercera Molar Impactada (Muela del Juicio)", category: "Cirugía", duration: 75, price: 480 },
    { id: "SRV-11", code: "IMP-601", name: "Implante Dental de Titanio Grado V + Tornillo de Cicatrización", category: "Implantología", duration: 90, price: 2200 },
    { id: "SRV-12", code: "ORT-701", name: "Control Mensual de Ortodoncia con Brackets Autoligables", category: "Ortodoncia", duration: 30, price: 200 },
    { id: "SRV-13", code: "EST-801", name: "Blanqueamiento Dental Clínico LED + Férulas Domiciliarias", category: "Estética", duration: 60, price: 550 },
    { id: "SRV-14", code: "PED-901", name: "Sellante de Fosas y Fisuras Pediátrico (por pieza)", category: "Odontopediatría", duration: 25, price: 90 }
  ],

  patients: [
    {
      id: "PAC-1001",
      name: "Lucía Fernanda Torres Cáceres",
      docType: "DNI",
      docNumber: "46829104",
      birthDate: "1991-04-14",
      age: 35,
      gender: "Femenino",
      phone: "+51 987 412 309",
      email: "lucia.torres@gmail.com",
      address: "Calle Los Laureles 245, San Isidro",
      insurance: "Rímac Seguros EPS (Cobertura 80%)",
      bloodType: "O+",
      emergencyContact: "Marco Torres (Esposo) — 987 110 223",
      alerts: ["Alergia a Penicilina y Amoxicilina", "Sensibilidad severa en sector posterior"],
      systemicConditions: ["Rinitis alérgica estacional"],
      currentMedication: "Loratadina 10mg ocasional",
      lastVisit: "2026-11-18",
      status: "En Tratamiento",
      dentitionType: "adult",
      clinicalNotes: "Paciente acude por dolor térmico en cuadrante superior derecho (pieza 16) y desea rehabilitar pieza 26 tratada previamente con endodoncia. Se prescribe Clindamicina en caso de requerir profilaxis antibiótica por alergia a betalactámicos.",
      odontogram: {
        "16": { surfaces: { O: "caries", M: "caries" }, whole: null, note: "Caries ocluso-mesial profunda sin compromiso pulpar aparente" },
        "14": { surfaces: { O: "restoration" }, whole: null, note: "Resina compuesta en buen estado" },
        "24": { surfaces: { O: "restoration", D: "restoration" }, whole: null, note: "Restauración antigua filtrada leve" },
        "26": { surfaces: {}, whole: "endo", note: "Endodoncia realizada hace 2 semanas; requiere corona cerámica" },
        "36": { surfaces: {}, whole: "crown", note: "Corona de zirconio cementada en 2024" },
        "38": { surfaces: {}, whole: "missing", note: "Exodoncia previa" },
        "46": { surfaces: { O: "caries" }, whole: null, note: "Lesión cariosa incipiente en surco central" },
        "48": { surfaces: {}, whole: "missing", note: "Exodoncia previa" }
      },
      evolutions: [
        {
          id: "EVO-01",
          date: "2026-11-18 10:30",
          dentist: "Dr. Carlos Eduardo Paredes",
          tooth: "26",
          procedure: "Endodoncia Mecanizada Multirradicular (Premolar/Molar)",
          soap: "S: Paciente asintomática tras medicación intraconducto. O: Conductos MV, DV y P permeables, obturación termoplástica con gutapercha y cemento biocerámico. Rx periapical confirma sellado a 0.5mm del ápice. A: Endodoncia pieza 26 concluida con éxito. P: Derivar a Rehabilitación Oral (Dra. Valeria Mendoza) para preparación de corona E.max.",
          attachment: "Rx Periapical Pza. 26 — Obturación Final"
        },
        {
          id: "EVO-02",
          date: "2026-11-05 16:00",
          dentist: "Dra. Valeria Mendoza Salazar",
          tooth: "General",
          procedure: "Consulta y Evaluación Integral + Diagnóstico Digital",
          soap: "S: Refiere molestia al frío en molar superior derecho. O: Examen intraoral e índice de higiene oral bueno (IHO 1.1). Se registra odontograma basal y fotografías intraorales. A: Caries dentinaria en 16 (O-M) y 46 (O). P: Se elabora plan de tratamiento integral y presupuesto aprobado.",
          attachment: "Panorámica Digital 2026-11"
        }
      ],
      radiographs: [
        { id: "RX-01", title: "Radiografía Panorámica Digital", date: "2026-11-05", tooth: "Arcada Completa", type: "Panorámica", finding: "Senos maxilares neumáticos; hueso alveolar conservado; obturación radicular óptima en pza 36." },
        { id: "RX-02", title: "Rx Periapical Control Endodóntico", date: "2026-11-18", tooth: "Pieza 26", type: "Periapical RVG", finding: "3 conductos obturados adecuadamente sin sobreobturación periapical." }
      ]
    },
    {
      id: "PAC-1002",
      name: "Roberto Alejandro Gómez Huamán",
      docType: "DNI",
      docNumber: "10492831",
      birthDate: "1968-09-22",
      age: 58,
      gender: "Masculino",
      phone: "+51 999 812 450",
      email: "rgomez.ing@outlook.com",
      address: "Av. Javier Prado Este 3190, San Borja",
      insurance: "Pacífico EPS",
      bloodType: "A+",
      emergencyContact: "Elena Gómez (Hija) — 994 312 800",
      alerts: ["Hipertensión Arterial Controlada", "Toma Aspirina 100mg (Suspender 5 días antes de cirugía)"],
      systemicConditions: ["Hipertensión arterial estadio 1"],
      currentMedication: "Losartán 50mg c/24h, Ácido Acetilsalicílico 100mg",
      lastVisit: "2026-11-20",
      status: "En Tratamiento",
      dentitionType: "adult",
      clinicalNotes: "Paciente en fase protésica de implante en zona 36 y cirugía programada de exodoncia en resto radicular 15. Controlar presión arterial en sillón antes de usar anestesia (preferir Mepivacaína sin vasoconstrictor o Lidocaína máx. 2 cartuchos).",
      odontogram: {
        "15": { surfaces: { O: "caries", M: "caries", D: "caries", V: "caries" }, whole: null, note: "Destrucción coronaria severa — indicada exodoncia e implante" },
        "17": { surfaces: { O: "restoration" }, whole: null, note: "Amalgama antigua estable" },
        "25": { surfaces: {}, whole: "crown", note: "Corona metal-porcelana" },
        "36": { surfaces: {}, whole: "implant", note: "Implante osteointegrado listo para rehabilitación" },
        "46": { surfaces: {}, whole: "missing", note: "Edéntulo parcial inferior derecho" },
        "47": { surfaces: { O: "restoration", M: "restoration" }, whole: null, note: "Resina compuesta M-O" }
      },
      evolutions: [
        {
          id: "EVO-03",
          date: "2026-11-20 09:15",
          dentist: "Dr. Martín Aguirre Vega",
          tooth: "36",
          procedure: "Control de Osteointegración y Colocación de Pilar Cicatrizal",
          soap: "S: Paciente sin dolor ni inflamación en zona 36. PA previa: 126/78 mmHg. O: Mucosa periimplantaria saludable, torque de estabilidad ISQ 76. A: Osteointegración exitosa en implante 36. P: Toma de impresión digital con escáner intraoral en próxima cita.",
          attachment: "Tomografía Cone Beam Sector 3"
        }
      ],
      radiographs: [
        { id: "RX-03", title: "Tomografía CBCT Mandibular Izquierda", date: "2026-09-12", tooth: "Pieza 36", type: "CBCT 3D", finding: "Implante 4.1 x 10mm centrado en reborde óseo a 3.2mm del conducto dentario inferior." }
      ]
    },
    {
      id: "PAC-1003",
      name: "Camila Valentina Salazar Quispe",
      docType: "DNI",
      docNumber: "73918205",
      birthDate: "2002-01-30",
      age: 24,
      gender: "Femenino",
      phone: "+51 945 678 123",
      email: "camila.salazar.q@pucp.edu.pe",
      address: "Jr. Mariscal Castilla 810, Magdalena del Mar",
      insurance: "Particular (Convenio Universitario)",
      bloodType: "B+",
      emergencyContact: "Rosa Quispe (Madre) — 945 100 911",
      alerts: ["Sin alergias medicamentosas conocidas (RAMA Negativo)"],
      systemicConditions: ["Ninguna"],
      currentMedication: "Ninguna",
      lastVisit: "2026-11-12",
      status: "Activo",
      dentitionType: "adult",
      clinicalNotes: "Paciente en mes 8 de tratamiento de Ortodoncia con brackets autoligables. Excelente colaboración con elásticos intermaxilares. Programada para control mensual y profilaxis.",
      odontogram: {
        "18": { surfaces: {}, whole: "missing", note: "Exodoncia por indicación ortodóntica" },
        "28": { surfaces: {}, whole: "missing", note: "Exodoncia por indicación ortodóntica" },
        "38": { surfaces: {}, whole: "missing", note: "Exodoncia previa" },
        "48": { surfaces: {}, whole: "missing", note: "Exodoncia previa" },
        "16": { surfaces: { O: "restoration" }, whole: null, note: "Sellante preventivo intacto" },
        "26": { surfaces: { O: "restoration" }, whole: null, note: "Sellante preventivo intacto" }
      },
      evolutions: [
        {
          id: "EVO-04",
          date: "2026-11-12 17:00",
          dentist: "Dra. Sofía Ríos Alarcón",
          tooth: "Arcada Sup/Inf",
          procedure: "Control Mensual de Ortodoncia con Brackets Autoligables",
          soap: "S: Sin molestias ni brackets desprendidos. O: Cambio de arco superior e inferior a NiTi Termoactivado 0.019x0.025. Cadena elástica de 13 a 23 para cierre de diastema residual. A: Evolución favorable en clase I canina bilateral. P: Cita de control en 4 semanas.",
          attachment: "Fotografías Intraorales Control Mes 8"
        }
      ],
      radiographs: [
        { id: "RX-04", title: "Cefalometría Lateral + Panorámica Ortodóntica", date: "2026-03-10", tooth: "Cráneo / Arcadas", type: "Cefalométrica", finding: "Biotipo mesofacial, Clase I esqueletal (ANB 2.5°), raíces paralelas sin reabsorción." }
      ]
    },
    {
      id: "PAC-1004",
      name: "Mateo Sebastián Delgado Ríos",
      docType: "DNI",
      docNumber: "91024819",
      birthDate: "2018-07-08",
      age: 8,
      gender: "Masculino",
      phone: "+51 981 334 776",
      email: "padres.mateo.delgado@gmail.com",
      address: "Calle Monte Rosa 180, Chacarilla — Surco",
      insurance: "Mapfre Salud EPS",
      bloodType: "O+",
      emergencyContact: "Claudia Ríos (Madre) — 981 334 776",
      alerts: ["Paciente Pediátrico — Ansiedad leve al instrumental rotatorio"],
      systemicConditions: ["Asma leve controlada (usa Salbutamol preventivo en invierno)"],
      currentMedication: "Ninguna actual",
      lastVisit: "2026-11-15",
      status: "Activo",
      dentitionType: "child",
      clinicalNotes: "Dentición mixta temprana. Se recomienda técnica decir-mostrar-hacer. Acude con su madre para sellantes preventivos y restauración de molar temporal 75.",
      odontogram: {
        "55": { surfaces: { O: "restoration" }, whole: null, note: "Ionómero de vidrio oclusal" },
        "65": { surfaces: { O: "restoration" }, whole: null, note: "Sellante preventivo" },
        "75": { surfaces: { O: "caries", D: "caries" }, whole: null, note: "Caries ocluso-distal en segundo molar deciduo" },
        "85": { surfaces: { O: "caries" }, whole: null, note: "Caries superficial de esmalte" }
      },
      evolutions: [
        {
          id: "EVO-05",
          date: "2026-11-15 11:00",
          dentist: "Dra. Valeria Mendoza Salazar",
          tooth: "55, 65",
          procedure: "Sellante de Fosas y Fisuras Pediátrico",
          soap: "S: Acude con su madre para control preventivo. O: Buen comportamiento durante la sesión. Aplicación de sellante resinoso con flúor en piezas 55 y 65. A: Riesgo cariogénico moderado. P: Programar restauración atraúmatica en pieza 75 y 85.",
          attachment: "Ficha Odontopediátrica"
        }
      ],
      radiographs: []
    },
    {
      id: "PAC-1005",
      name: "Jorge Luis Villavicencio Prado",
      docType: "DNI",
      docNumber: "42109834",
      birthDate: "1983-11-19",
      age: 43,
      gender: "Masculino",
      phone: "+51 976 543 210",
      email: "jvillavicencio@corporacionvp.pe",
      address: "Av. El Golf Los Incas 490, Monterrico — Surco",
      insurance: "Particular",
      bloodType: "O-",
      emergencyContact: "Patricia Prado — 976 111 222",
      alerts: ["Bruxismo Nocturno Severo", "Alergia al Látex (Usar guantes de Nitrilo)"],
      systemicConditions: ["Bruxismo céntrico y excéntrico"],
      currentMedication: "Ninguna",
      lastVisit: "2026-11-22",
      status: "En Tratamiento",
      dentitionType: "adult",
      clinicalNotes: "Paciente ejecutivo que requiere rehabilitación estética del sector anterior por desgaste incisal (bruxismo) y blanqueamiento clínico previo a carillas/coronas.",
      odontogram: {
        "11": { surfaces: { O: "restoration" }, whole: null, note: "Borde incisal reconstruido por atrición" },
        "21": { surfaces: { O: "restoration" }, whole: null, note: "Borde incisal reconstruido por atrición" },
        "16": { surfaces: {}, whole: "crown", note: "Corona de disilicato" },
        "26": { surfaces: { O: "restoration" }, whole: null, note: "Incrustación cerámica" },
        "37": { surfaces: { O: "caries" }, whole: null, note: "Caries en fosa central" }
      },
      evolutions: [
        {
          id: "EVO-06",
          date: "2026-11-22 15:00",
          dentist: "Dra. Valeria Mendoza Salazar",
          tooth: "Arcada Sup/Inf",
          procedure: "Profilaxis Ultrasónica + Destartraje + Fluorización",
          soap: "S: Desea iniciar fase higiénica previa a blanqueamiento LED. O: Uso obligatorio de guantes de nitrilo (alergia a látex). Eliminación de cálculo supragingival y pulido con pasta diamantada. A: Tejidos gingivales sanos sin sangrado al sondaje. P: Cita hoy para Blanqueamiento Clínico LED y restauración de pza 37.",
          attachment: "Registro de Color VITA Inicial: A3"
        }
      ],
      radiographs: [
        { id: "RX-05", title: "Serie Radiográfica Bitewing Bilateral", date: "2026-11-22", tooth: "Sector Posterior", type: "Bitewing", finding: "Caries oclusal dentinaria superficial en pza 37; crestas alveolares conservadas." }
      ]
    }
  ],

  appointments: [
    {
      id: "CIT-201",
      date: "2026-11-24",
      time: "09:00",
      duration: 60,
      patientId: "PAC-1001",
      patientName: "Lucía Fernanda Torres Cáceres",
      dentistId: "DOC-01",
      dentistName: "Dra. Valeria Mendoza Salazar",
      chair: "Consultorio 1",
      serviceId: "SRV-04",
      serviceName: "Restauración con Resina Compuesta Compleja (Pza. 16)",
      tooth: "16",
      status: "Atendida",
      notes: "Usar anestesia sin problemas; paciente alérgica a Penicilina."
    },
    {
      id: "CIT-202",
      date: "2026-11-24",
      time: "10:15",
      duration: 60,
      patientId: "PAC-1002",
      patientName: "Roberto Alejandro Gómez Huamán",
      dentistId: "DOC-04",
      dentistName: "Dr. Martín Aguirre Vega",
      chair: "Consultorio 1",
      serviceId: "SRV-09",
      serviceName: "Exodoncia Simple Atraumática (Resto Radicular 15)",
      tooth: "15",
      status: "En Sillón",
      notes: "Controlar PA previa. Suspendió Aspirina hace 5 días."
    },
    {
      id: "CIT-203",
      date: "2026-11-24",
      time: "11:00",
      duration: 60,
      patientId: "PAC-1005",
      patientName: "Jorge Luis Villavicencio Prado",
      dentistId: "DOC-01",
      dentistName: "Dra. Valeria Mendoza Salazar",
      chair: "Consultorio 1",
      serviceId: "SRV-13",
      serviceName: "Blanqueamiento Dental Clínico LED + Férulas",
      tooth: "Arcadas",
      status: "En Sala",
      notes: "¡ALERTA! Alergia al Látex — Preparar mesa solo con guantes de Nitrilo."
    },
    {
      id: "CIT-204",
      date: "2026-11-24",
      time: "12:30",
      duration: 30,
      patientId: "PAC-1003",
      patientName: "Camila Valentina Salazar Quispe",
      dentistId: "DOC-03",
      dentistName: "Dra. Sofía Ríos Alarcón",
      chair: "Consultorio 3",
      serviceId: "SRV-12",
      serviceName: "Control Mensual de Ortodoncia con Brackets Autoligables",
      tooth: "General",
      status: "Confirmada",
      notes: "Evaluar cierre de diastema superior y entregar elásticos 3/16."
    },
    {
      id: "CIT-205",
      date: "2026-11-24",
      time: "15:30",
      duration: 40,
      patientId: "PAC-1004",
      patientName: "Mateo Sebastián Delgado Ríos",
      dentistId: "DOC-01",
      dentistName: "Dra. Valeria Mendoza Salazar",
      chair: "Consultorio 1",
      serviceId: "SRV-03",
      serviceName: "Restauración Fotopolimerizable Pediátrica (Pza. 75)",
      tooth: "75",
      status: "Confirmada",
      notes: "Acude con su madre. Preparar gafas de protección infantiles."
    },
    {
      id: "CIT-206",
      date: "2026-11-24",
      time: "16:30",
      duration: 90,
      patientId: "PAC-1001",
      patientName: "Lucía Fernanda Torres Cáceres",
      dentistId: "DOC-02",
      dentistName: "Dr. Carlos Eduardo Paredes",
      chair: "Consultorio 2",
      serviceId: "SRV-07",
      serviceName: "Tallado y Escaneo Digital para Corona E.max (Pza. 26)",
      tooth: "26",
      status: "Pendiente",
      notes: "Confirmar asistencia por WhatsApp."
    },
    {
      id: "CIT-207",
      date: "2026-11-25",
      time: "09:30",
      duration: 60,
      patientId: "PAC-1002",
      patientName: "Roberto Alejandro Gómez Huamán",
      dentistId: "DOC-01",
      dentistName: "Dra. Valeria Mendoza Salazar",
      chair: "Consultorio 1",
      serviceId: "SRV-07",
      serviceName: "Escaneo Intraoral para Corona sobre Implante (Pza. 36)",
      tooth: "36",
      status: "Confirmada",
      notes: "Enviar archivo STL al laboratorio dental."
    },
    {
      id: "CIT-208",
      date: "2026-11-25",
      time: "11:00",
      duration: 45,
      patientId: "PAC-1003",
      patientName: "Camila Valentina Salazar Quispe",
      dentistId: "DOC-01",
      dentistName: "Dra. Valeria Mendoza Salazar",
      chair: "Consultorio 2",
      serviceId: "SRV-02",
      serviceName: "Profilaxis Ultrasónica con AirFlow para Brackets",
      tooth: "General",
      status: "Confirmada",
      notes: "Limpieza profunda alrededor de arcos ortodónticos."
    }
  ],

  budgets: [
    {
      id: "PRE-501",
      patientId: "PAC-1001",
      patientName: "Lucía Fernanda Torres Cáceres",
      createdAt: "2026-11-05",
      dentistName: "Dra. Valeria Mendoza Salazar",
      status: "En Curso",
      discountPercent: 10,
      items: [
        { id: "IT-1", serviceId: "SRV-01", name: "Consulta y Evaluación Integral + Diagnóstico Digital", tooth: "General", price: 80, status: "Completado" },
        { id: "IT-2", serviceId: "SRV-06", name: "Endodoncia Mecanizada Multirradicular", tooth: "26", price: 650, status: "Completado" },
        { id: "IT-3", serviceId: "SRV-04", name: "Restauración con Resina Compuesta Compleja (O-M)", tooth: "16", price: 210, status: "Completado" },
        { id: "IT-4", serviceId: "SRV-07", name: "Corona Libre de Metal en Disilicato E.max", tooth: "26", price: 1150, status: "En Proceso" },
        { id: "IT-5", serviceId: "SRV-03", name: "Restauración Fotopolimerizable con Resina Simple (O)", tooth: "46", price: 140, status: "Pendiente" }
      ],
      payments: [
        { id: "PAG-01", date: "2026-11-05", amount: 500, method: "Tarjeta Crédito Visa", reference: "OP-88412" },
        { id: "PAG-02", date: "2026-11-18", amount: 800, method: "Transferencia Bancaria", reference: "TR-33910" }
      ]
    },
    {
      id: "PRE-502",
      patientId: "PAC-1002",
      patientName: "Roberto Alejandro Gómez Huamán",
      createdAt: "2026-10-15",
      dentistName: "Dr. Martín Aguirre Vega",
      status: "En Curso",
      discountPercent: 5,
      items: [
        { id: "IT-6", serviceId: "SRV-11", name: "Implante Dental de Titanio Grado V + Tornillo", tooth: "36", price: 2200, status: "Completado" },
        { id: "IT-7", serviceId: "SRV-07", name: "Corona Zirconio Atornillada sobre Implante", tooth: "36", price: 1150, status: "En Proceso" },
        { id: "IT-8", serviceId: "SRV-09", name: "Exodoncia Simple Atraumática", tooth: "15", price: 180, status: "En Proceso" }
      ],
      payments: [
        { id: "PAG-03", date: "2026-10-15", amount: 2200, method: "Transferencia Bancaria BCP", reference: "BCP-99104" }
      ]
    },
    {
      id: "PRE-503",
      patientId: "PAC-1005",
      patientName: "Jorge Luis Villavicencio Prado",
      createdAt: "2026-11-22",
      dentistName: "Dra. Valeria Mendoza Salazar",
      status: "Aprobado",
      discountPercent: 0,
      items: [
        { id: "IT-9", serviceId: "SRV-02", name: "Profilaxis Ultrasónica + Destartraje + Fluorización", tooth: "General", price: 150, status: "Completado" },
        { id: "IT-10", serviceId: "SRV-13", name: "Blanqueamiento Dental Clínico LED + Férulas Domiciliarias", tooth: "Arcadas", price: 550, status: "En Proceso" },
        { id: "IT-11", serviceId: "SRV-03", name: "Restauración Fotopolimerizable con Resina Simple", tooth: "37", price: 140, status: "Pendiente" }
      ],
      payments: [
        { id: "PAG-04", date: "2026-11-22", amount: 400, method: "Tarjeta Amex", reference: "POS-41209" }
      ]
    }
  ]
};
