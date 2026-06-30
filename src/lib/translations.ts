export const translations = {
  en: {
    sidebar: {
      dashboard: "Dashboard",
      academic: "Academic",
      students: "Students",
      teachers: "Teachers",
      parents: "Parents",
      attendance: "Attendance",
      grades: "Grades",
      planning: "Planning",
      enrollments: "Enrollments",
      scholarships: "Scholarships",
      communications: "Communications",
      schools: "Schools",
      tasks: "Tasks",
      reports: "Reports",
      logout: "Log out",
      schoolYears: "School Years",
      gradesCatalog: "Grades Catalog",
      groups: "Groups",
      catalogs: "Catalogs"
    },
    header: {
      searchPlaceholder: "Search metrics, users...",
      schoolLabel: "Demo School",
      roleLabel: "School Admin",
      profile: {
        settings: "Profile Settings",
        admin: "System Admin",
        logout: "Log Out"
      },
      notifications: {
        title: "Notifications",
        markAllRead: "Mark all read",
        notif1_title: "New user registered",
        notif1_desc: "Carlos Mendoza has joined",
        notif1_time: "5m ago",
        notif2_title: "Server capacity alert",
        notif2_desc: "Traffic spike detected on API",
        notif2_time: "15m ago",
        notif3_title: "Monthly report ready",
        notif3_desc: "May revenue report is ready for download",
        notif3_time: "2h ago"
      }
    },
    dashboard: {
      welcomeTitle: "Welcome back, John!",
      welcomeSubtitle: "Here is what is happening at Reykjavík Academy today. You have 3 pending teacher lesson plans to review.",
      createNoticeButton: "Create Notice",
      stats: {
        totalStudents: "Total Students",
        activeTeachers: "Active Teachers",
        avgAttendance: "Avg Attendance",
        reportCards: "Report Cards",
        studentsDetail: "+4.2% since last semester",
        teachersDetail: "100% active teaching status",
        attendanceDetail: "+0.8% increase this week",
        cardsDetail: "98% evaluations submitted"
      },
      auditLog: {
        title: "System Audit Log",
        viewAll: "View All",
        row1_title: "New Student Enrolled",
        row1_desc: "María Jónsdóttir was assigned to Group 10-A by school admin.",
        row1_time: "12 minutes ago",
        row2_title: "Lesson Plan Submitted",
        row2_desc: "Teacher Gunnar Ólafsson submitted weekly planning for Grade 9 Mathematics.",
        row2_time: "1 hour ago",
        row3_title: "Term Period Ended",
        row3_desc: "Midterm Period 1 officially closed. Grading records are locked.",
        row3_time: "3 hours ago"
      },
      quickAccess: {
        title: "Quick Access",
        classes: "Classes",
        rosters: "Rosters",
        schedules: "Schedules",
        reports: "Reports"
      }
    },
    login: {
      title: "Menntun",
      subtitle: "Sign in to your account",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      signinButton: "Sign In",
      signingButton: "Signing In...",
      errorFields: "Please fill in all fields",
      errorGeneric: "Invalid credentials or login failed"
    },
    schools: {
      title: "Schools Management",
      subtitle: "List, create, update and activate/deactivate institutional school entities in the platform.",
      createBtn: "Create School",
      editBtn: "Edit",
      deactivateBtn: "Deactivate",
      activateBtn: "Activate",
      table: {
        name: "School Name",
        code: "Identifier Code",
        status: "Status",
        actions: "Actions",
        address: "Address",
        phone: "Phone",
        email: "Email"
      },
      status: {
        active: "Active",
        inactive: "Inactive"
      },
      modal: {
        createTitle: "Create New School",
        editTitle: "Edit School Details",
        nameLabel: "School Name",
        codeLabel: "Identifier Code (unique, e.g. DEMO-002)",
        addressLabel: "Address (optional)",
        phoneLabel: "Phone Number (optional)",
        emailLabel: "Contact Email (optional)",
        save: "Save Entity",
        cancel: "Cancel",
        loading: "Processing..."
      },
      alerts: {
        successCreate: "School created successfully",
        successUpdate: "School updated successfully",
        errorCreate: "Failed to create school",
        errorUpdate: "Failed to update school",
        errorFetch: "Failed to load schools list"
      },
      noData: "No schools found. Click the button above to register the first school.",
      tabs: {
        details: "General Details",
        modules: "Modules Status",
        users: "User Roster"
      },
      details: {
        contactLocation: "Contact & Location",
        address: "Physical Address",
        phone: "Phone Number",
        email: "Email Address",
        accountInfo: "Account Information",
        activeStatus: "Active Status",
        registeredUsers: "Registered Users",
        createdAt: "Registration Date"
      },
      modules: {
        title: "Active Modules",
        subtitle: "Toggle optional packages contracted for this school. Core modules are always enabled.",
        colName: "Module Name",
        colStatus: "Active Status",
        colType: "Type",
        core: "Core (Required)",
        optional: "Optional",
        coreActive: "Core Active",
        errorToggle: "Failed to update module status"
      },
      users: {
        title: "School Members",
        subtitle: "View and manage staff, administrators, teachers, and directors of this school.",
        addBtn: "Register User",
        noUsers: "No users registered to this school yet.",
        errorFetch: "Failed to load users list",
        table: {
          name: "Full Name",
          email: "Email Address",
          role: "Role / Position",
          status: "Status",
          actions: "Actions"
        },
        roles: {
          SUPER_ADMIN: "Super Administrator",
          SCHOOL_ADMIN: "School Unit Administrator",
          TEACHER: "Teacher / Instructor",
          STUDENT: "Student",
          PARENT: "Parent / Guardian",
          TUTOR: "Tutor",
          DIRECTOR: "Director",
          TREASURER: "Treasurer"
        },
        modal: {
          createTitle: "Register User",
          editTitle: "Edit User Status & Role",
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email Address",
          phone: "Phone Number (optional)",
          password: "Temporary Password (min. 6 chars)",
          role: "System Role",
          position: "Display Position",
          positionOptions: {
            admin: "School Unit Administrator",
            director: "Director",
            treasurer: "Treasurer",
            teacher: "Teacher"
          },
          status: "Account Status",
          save: "Register",
          update: "Save",
          cancel: "Cancel",
          loading: "Saving...",
          errorCreate: "Failed to register user",
          errorUpdate: "Failed to update user"
        }
      }
    },
    teachers: {
      title: "Teachers Directory",
      subtitle: "Manage teacher profiles, classroom assignments, and optional module permissions.",
      registerBtn: "Register Teacher",
      noData: "No teachers found. Register the first teacher to get started.",
      table: {
        name: "Full Name",
        email: "Email Address",
        phone: "Phone",
        employeeNumber: "Emp. Number",
        specialty: "Specialty",
        status: "Status",
        actions: "Actions"
      },
      modal: {
        createTitle: "Register New Teacher",
        editTitle: "Edit Teacher Profile",
        employeeNumberLabel: "Employee Number (optional)",
        specialtyLabel: "Specialty / Subject Area (optional)",
        hireDateLabel: "Hire Date (optional)",
        allowedModulesLabel: "Teacher Access Permissions",
        allowedModulesSubtitle: "Toggle modules this teacher is authorized to access.",
        save: "Save Profile",
        cancel: "Cancel",
        loading: "Processing...",
        passwordLabel: "Temporary Password (min. 6 chars)"
      },
      details: {
        generalInfo: "General Profile",
        permissions: "Module Permissions",
        assignments: "Groups & Subjects",
        noAssignments: "No active group or subject assignments for this teacher.",
        class: "Class / Group",
        subject: "Subject Name",
        level: "Grade Level",
        schoolYear: "School Year",
        role: "System Role",
        schoolName: "Institution"
      },
      alerts: {
        successCreate: "Teacher registered successfully",
        successUpdate: "Teacher profile updated successfully",
        errorCreate: "Failed to register teacher",
        errorUpdate: "Failed to update teacher profile",
        errorFetch: "Failed to load teachers list"
      }
    },
    students: {
      title: "Students Directory",
      subtitle: "Manage student profiles, group enrollments, and details.",
      registerBtn: "Register Student",
      noData: "No students found. Register the first student to get started.",
      table: {
        name: "Full Name",
        email: "Email Address",
        phone: "Phone",
        enrollmentNumber: "Matrícula",
        status: "Status",
        group: "Group",
        actions: "Actions"
      },
      modal: {
        createTitle: "Register New Student",
        editTitle: "Edit Student Profile",
        enrollmentNumberLabel: "Matrícula / ID (optional)",
        birthDateLabel: "Birth Date (optional)",
        genderLabel: "Gender (optional)",
        bloodTypeLabel: "Blood Type (optional)",
        addressLabel: "Address (optional)",
        groupIdLabel: "Assign to Group (optional)",
        selectGroupPlaceholder: "Select a group...",
        selectGenderPlaceholder: "Select gender...",
        save: "Save Profile",
        cancel: "Cancel",
        loading: "Processing...",
        passwordLabel: "Temporary Password (min. 6 chars)",
        statusLabel: "Status"
      },
      details: {
        generalInfo: "General Profile",
        enrollments: "Enrollments",
        noEnrollments: "No active group enrollments.",
        class: "Group",
        enrolledAt: "Enrolled At",
        status: "Status",
        role: "System Role",
        schoolName: "Institution"
      },
      alerts: {
        successCreate: "Student registered successfully",
        successUpdate: "Student profile updated successfully",
        successDelete: "Student deleted successfully",
        errorCreate: "Failed to register student",
        errorUpdate: "Failed to update student profile",
        errorDelete: "Failed to delete student",
        errorFetch: "Failed to load students list"
      }
    },
    schoolYears: {
      title: "School Years",
      subtitle: "Manage academic cycles and their corresponding periods for each school.",
      createBtn: "New School Year",
      noData: "No school years found. Create the first academic cycle to get started.",
      allSchools: "All Schools",
      filterBySchool: "Filter by school",
      status: {
        active: "Active",
        closed: "Closed"
      },
      table: {
        name: "Name",
        school: "School",
        startDate: "Start Date",
        endDate: "End Date",
        periods: "Periods",
        groups: "Groups",
        status: "Status",
        actions: "Actions"
      },
      modal: {
        createTitle: "Create School Year",
        editTitle: "Edit School Year",
        nameLabel: "Cycle Name (e.g. 2024-2025)",
        startDateLabel: "Start Date",
        endDateLabel: "End Date",
        schoolLabel: "School (Super Admin only)",
        periodsSection: "Periods (optional)",
        addPeriod: "Add Period",
        removePeriod: "Remove",
        periodName: "Period Name (e.g. Quarter 1)",
        periodStart: "Period Start",
        periodEnd: "Period End",
        periodOrder: "Order",
        save: "Save",
        cancel: "Cancel",
        loading: "Saving..."
      },
      detail: {
        title: "School Year Detail",
        generalInfo: "General Information",
        periodsTitle: "Periods",
        school: "School",
        startDate: "Start Date",
        endDate: "End Date",
        status: "Status",
        groups: "Assigned Groups",
        noPeriods: "No periods defined yet.",
        addPeriod: "Add Period",
        periodName: "Period Name",
        order: "Order",
        closeYear: "Close School Year",
        closeYearConfirm: "Are you sure you want to close this school year? This cannot be undone.",
        deleteYear: "Delete School Year",
        deleteYearConfirm: "Are you sure you want to delete this school year? This will also delete all its periods."
      },
      alerts: {
        successCreate: "School year created successfully",
        successUpdate: "School year updated successfully",
        successClose: "School year closed successfully",
        successDelete: "School year deleted successfully",
        successAddPeriod: "Period added successfully",
        successDeletePeriod: "Period deleted successfully",
        errorCreate: "Failed to create school year",
        errorUpdate: "Failed to update school year",
        errorClose: "Failed to close school year",
        errorDelete: "Failed to delete school year",
        errorFetch: "Failed to load school years",
        errorAddPeriod: "Failed to add period",
        errorDeletePeriod: "Failed to delete period"
      }
    },
    grades: {
      title: "Grades Catalog",
      subtitle: "Configure the grades catalog (e.g. 1st Grade, 2nd Grade) for each school.",
      createBtn: "Create Grade",
      noData: "No grades found. Create the first grade to get started.",
      table: {
        name: "Name",
        level: "Level / Stage",
        order: "Display Order",
        groups: "Class Groups",
        school: "School",
        actions: "Actions"
      },
      modal: {
        createTitle: "Create Grade",
        editTitle: "Edit Grade",
        nameLabel: "Grade Name (e.g. 1° Primaria)",
        levelLabel: "Level / Educational Stage",
        levelPlaceholder: "Select level...",
        customLevelPlaceholder: "Enter custom level name (e.g. Nursery)",
        levelSelectOptions: {
          preschool: "Preschool",
          primary: "Primary",
          secondary: "Secondary",
          highschool: "High School",
          custom: "Other / Custom"
        },
        orderLabel: "Sort Order",
        schoolLabel: "School (Super Admin only)",
        save: "Save",
        cancel: "Cancel",
        loading: "Saving..."
      },
      alerts: {
        successCreate: "Grade created successfully",
        successUpdate: "Grade updated successfully",
        successDelete: "Grade deleted successfully",
        errorCreate: "Failed to create grade",
        errorUpdate: "Failed to update grade",
        errorDelete: "Failed to delete grade. Make sure it has no active class groups.",
        errorFetch: "Failed to load grades"
      }
    },
    groups: {
      title: "Groups Directory",
      subtitle: "Manage school classroom groups, school year assignments, and teacher links.",
      createBtn: "Create Group",
      noData: "No groups found. Create the first group to get started.",
      table: {
        name: "Group Name",
        grade: "Grade",
        schoolYear: "School Year",
        teachers: "Teachers",
        students: "Students",
        capacity: "Capacity",
        school: "School",
        actions: "Actions"
      },
      modal: {
        createTitle: "Create Group",
        editTitle: "Edit Group",
        nameLabel: "Group Name (e.g. A, B, 101)",
        gradeLabel: "Grade",
        schoolYearLabel: "School Year",
        maxStudentsLabel: "Max Students Limit (optional)",
        schoolLabel: "School (Super Admin only)",
        save: "Save",
        cancel: "Cancel",
        loading: "Saving..."
      },
      detail: {
        title: "Group Details",
        generalTab: "General Information",
        teachersTab: "Assigned Teachers",
        studentsTab: "Enrolled Students",
        grade: "Grade",
        schoolYear: "School Year",
        capacity: "Maximum Capacity",
        studentsCount: "Enrolled Students Count",
        addTeacher: "Assign Teacher",
        isHomeroom: "Homeroom Teacher",
        noTeachers: "No teachers assigned to this group yet.",
        teacherSelectLabel: "Select Teacher",
        assignBtn: "Assign",
        removeConfirm: "Are you sure you want to remove this teacher from this group?"
      },
      alerts: {
        successCreate: "Group created successfully",
        successUpdate: "Group updated successfully",
        successDelete: "Group deleted successfully",
        successAssignTeacher: "Teacher assigned to group successfully",
        successRemoveTeacher: "Teacher removed from group successfully",
        errorCreate: "Failed to create group",
        errorUpdate: "Failed to update group",
        errorDelete: "Failed to delete group",
        errorAssignTeacher: "Failed to assign teacher",
        errorRemoveTeacher: "Failed to remove teacher",
        errorFetch: "Failed to load groups"
      }
    }
  },
  es: {
    sidebar: {
      dashboard: "Inicio",
      academic: "Académico",
      students: "Estudiantes",
      teachers: "Profesores",
      parents: "Padres",
      attendance: "Asistencia",
      grades: "Calificaciones",
      planning: "Planeación",
      enrollments: "Inscripciones",
      scholarships: "Becas",
      communications: "Comunicaciones",
      schools: "Escuelas",
      tasks: "Tareas",
      reports: "Reportes",
      logout: "Cerrar sesión",
      schoolYears: "Ciclos Escolares",
      gradesCatalog: "Catálogo de Grados",
      groups: "Grupos",
      catalogs: "Catálogos"
    },
    header: {
      searchPlaceholder: "Buscar métricas, usuarios...",
      schoolLabel: "Colegio Demo",
      roleLabel: "Administrador",
      profile: {
        settings: "Configuración de perfil",
        admin: "Administración del sistema",
        logout: "Cerrar sesión"
      },
      notifications: {
        title: "Notificaciones",
        markAllRead: "Marcar leídas",
        notif1_title: "Nuevo usuario registrado",
        notif1_desc: "Carlos Mendoza se ha unido",
        notif1_time: "Hace 5 min",
        notif2_title: "Servidor al 92% de capacidad",
        notif2_desc: "Pico de tráfico detectado en API",
        notif2_time: "Hace 15 min",
        notif3_title: "Reporte mensual listo",
        notif3_desc: "El reporte de ingresos de Mayo está listo para descarga",
        notif3_time: "Hace 2 horas"
      }
    },
    dashboard: {
      welcomeTitle: "¡Bienvenido de nuevo, John!",
      welcomeSubtitle: "Esto es lo que está sucediendo hoy en Reykjavík Academy. Tienes 3 planes de lecciones pendientes de revisar.",
      createNoticeButton: "Crear Aviso",
      stats: {
        totalStudents: "Estudiantes Totales",
        activeTeachers: "Profesores Activos",
        avgAttendance: "Asistencia Promedio",
        reportCards: "Reportes Académicos",
        studentsDetail: "+4.2% desde el semestre pasado",
        teachersDetail: "100% estado docente activo",
        attendanceDetail: "+0.8% de aumento esta semana",
        cardsDetail: "98% de evaluaciones entregadas"
      },
      auditLog: {
        title: "Registro de Auditoría",
        viewAll: "Ver Todo",
        row1_title: "Nuevo Estudiante Inscrito",
        row1_desc: "María Jónsdóttir fue asignada al Grupo 10-A por la administración escolar.",
        row1_time: "Hace 12 minutos",
        row2_title: "Plan de Lección Entregado",
        row2_desc: "El profesor Gunnar Ólafsson entregó la planeación semanal para Matemáticas de 9° grado.",
        row2_time: "Hace 1 hora",
        row3_title: "Periodo Escolar Concluido",
        row3_desc: "El Periodo Parcial 1 se cerró oficialmente. Los registros de calificaciones están bloqueados.",
        row3_time: "Hace 3 horas"
      },
      quickAccess: {
        title: "Acceso Rápido",
        classes: "Clases",
        rosters: "Listas",
        schedules: "Horarios",
        reports: "Reportes"
      }
    },
    login: {
      title: "Menntun",
      subtitle: "Inicia sesión en tu cuenta",
      emailLabel: "Correo Electrónico",
      passwordLabel: "Contraseña",
      signinButton: "Iniciar Sesión",
      signingButton: "Iniciando Sesión...",
      errorFields: "Por favor completa todos los campos",
      errorGeneric: "Credenciales inválidas o inicio fallido"
    },
    schools: {
      title: "Gestión de Escuelas",
      subtitle: "Lista, crea, actualiza y activa/desactiva las entidades escolares de la plataforma.",
      createBtn: "Crear Escuela",
      editBtn: "Editar",
      deactivateBtn: "Desactivar",
      activateBtn: "Activar",
      table: {
        name: "Nombre de la Escuela",
        code: "Código Identificador",
        status: "Estado",
        actions: "Acciones",
        address: "Dirección",
        phone: "Teléfono",
        email: "Correo Electrónico"
      },
      status: {
        active: "Activa",
        inactive: "Inactiva"
      },
      modal: {
        createTitle: "Crear Nueva Escuela",
        editTitle: "Editar Detalles de la Escuela",
        nameLabel: "Nombre de la Escuela",
        codeLabel: "Código Identificador (único, ej. DEMO-002)",
        addressLabel: "Dirección (opcional)",
        phoneLabel: "Número Telefónico (opcional)",
        emailLabel: "Correo Electrónico (opcional)",
        save: "Guardar Entidad",
        cancel: "Cancelar",
        loading: "Procesando..."
      },
      alerts: {
        successCreate: "Escuela creada exitosamente",
        successUpdate: "Escuela actualizada exitosamente",
        errorCreate: "Error al crear la escuela",
        errorUpdate: "Error al actualizar la escuela",
        errorFetch: "Error al cargar la lista de escuelas"
      },
      noData: "No se encontraron escuelas. Haz clic en el botón de arriba para registrar la primera escuela.",
      tabs: {
        details: "Detalles Generales",
        modules: "Estado de Módulos",
        users: "Lista de Usuarios"
      },
      details: {
        contactLocation: "Contacto y Ubicación",
        address: "Dirección Física",
        phone: "Número de Teléfono",
        email: "Correo Electrónico",
        accountInfo: "Información de la Cuenta",
        activeStatus: "Estado de Activación",
        registeredUsers: "Usuarios Registrados",
        createdAt: "Fecha de Registro"
      },
      modules: {
        title: "Módulos Activos",
        subtitle: "Activa o desactiva los módulos opcionales contratados. Módulos esenciales siempre activos.",
        colName: "Nombre del Módulo",
        colStatus: "Estado Activo",
        colType: "Tipo",
        core: "Esencial",
        optional: "Opcional",
        coreActive: "Activo (Esencial)",
        errorToggle: "Error al actualizar el estado del módulo"
      },
      users: {
        title: "Miembros de la Escuela",
        subtitle: "Visualiza y administra el personal administrativo, maestros y directores de esta escuela.",
        addBtn: "Registrar Usuario",
        noUsers: "No hay usuarios registrados en esta escuela aún.",
        errorFetch: "Error al cargar la lista de usuarios",
        table: {
          name: "Nombre Completo",
          email: "Correo Electrónico",
          role: "Puesto / Rol",
          status: "Estado",
          actions: "Acciones"
        },
        roles: {
          SUPER_ADMIN: "Super Administrador",
          SCHOOL_ADMIN: "Administrador de Unidad",
          TEACHER: "Maestro",
          STUDENT: "Estudiante",
          PARENT: "Padre de Familia",
          TUTOR: "Tutor",
          DIRECTOR: "Director",
          TREASURER: "Tesorero"
        },
        modal: {
          createTitle: "Registrar Usuario",
          editTitle: "Editar Estado y Rol de Usuario",
          firstName: "Nombre",
          lastName: "Apellido",
          email: "Correo Electrónico",
          phone: "Número Telefónico (opcional)",
          password: "Contraseña Temporal (mín. 6 caracteres)",
          role: "Rol del Sistema",
          position: "Puesto de Visualización",
          positionOptions: {
            admin: "Administrador de Unidad Escolar",
            director: "Director",
            treasurer: "Tesorero",
            teacher: "Maestro"
          },
          status: "Estado de la Cuenta",
          save: "Registrar",
          update: "Guardar",
          cancel: "Cancelar",
          loading: "Guardando...",
          errorCreate: "Error al registrar usuario",
          errorUpdate: "Error al actualizar usuario"
        }
      }
    },
    teachers: {
      title: "Directorio de Profesores",
      subtitle: "Administra los perfiles de profesores, asignaciones académicas y permisos de acceso a módulos.",
      registerBtn: "Registrar Profesor",
      noData: "No se encontraron profesores. Registra al primer profesor para comenzar.",
      table: {
        name: "Nombre Completo",
        email: "Correo Electrónico",
        phone: "Teléfono",
        employeeNumber: "N° Empleado",
        specialty: "Especialidad",
        status: "Estado",
        actions: "Acciones"
      },
      modal: {
        createTitle: "Registrar Nuevo Profesor",
        editTitle: "Editar Perfil del Profesor",
        employeeNumberLabel: "Número de Empleado (opcional)",
        specialtyLabel: "Especialidad / Área de Materia (opcional)",
        hireDateLabel: "Fecha de Contratación (opcional)",
        allowedModulesLabel: "Permisos de Acceso del Profesor",
        allowedModulesSubtitle: "Activa los módulos a los que este profesor tiene autorización de acceder.",
        save: "Guardar Perfil",
        cancel: "Cancelar",
        loading: "Procesando...",
        passwordLabel: "Contraseña Temporal (mín. 6 caracteres)"
      },
      details: {
        generalInfo: "Perfil General",
        permissions: "Permisos de Módulos",
        assignments: "Grupos y Materias",
        noAssignments: "No hay asignaciones activas de grupos o materias para este profesor.",
        class: "Clase / Grupo",
        subject: "Nombre de la Materia",
        level: "Grado Escolar",
        schoolYear: "Ciclo Escolar",
        role: "Rol del Sistema",
        schoolName: "Institución"
      },
      alerts: {
        successCreate: "Profesor registrado exitosamente",
        successUpdate: "Perfil del profesor actualizado exitosamente",
        errorCreate: "Error al registrar profesor",
        errorUpdate: "Error al actualizar perfil del profesor",
        errorFetch: "Error al cargar la lista de profesores"
      }
    },
    students: {
      title: "Directorio de Alumnos",
      subtitle: "Administra los perfiles de alumnos, inscripciones a grupos y detalles.",
      registerBtn: "Registrar Alumno",
      noData: "No se encontraron alumnos. Registra al primer alumno para comenzar.",
      table: {
        name: "Nombre Completo",
        email: "Correo Electrónico",
        phone: "Teléfono",
        enrollmentNumber: "Matrícula",
        status: "Estado",
        group: "Grupo",
        actions: "Acciones"
      },
      modal: {
        createTitle: "Registrar Nuevo Alumno",
        editTitle: "Editar Perfil del Alumno",
        enrollmentNumberLabel: "Matrícula / ID (opcional)",
        birthDateLabel: "Fecha de Nacimiento (opcional)",
        genderLabel: "Género (opcional)",
        bloodTypeLabel: "Tipo de Sangre (opcional)",
        addressLabel: "Dirección (opcional)",
        groupIdLabel: "Asignar a Grupo (opcional)",
        selectGroupPlaceholder: "Seleccionar grupo...",
        selectGenderPlaceholder: "Seleccionar género...",
        save: "Guardar Perfil",
        cancel: "Cancelar",
        loading: "Procesando...",
        passwordLabel: "Contraseña Temporal (mín. 6 caracteres)",
        statusLabel: "Estado"
      },
      details: {
        generalInfo: "Perfil General",
        enrollments: "Inscripciones",
        noEnrollments: "Sin inscripciones a grupos activas.",
        class: "Grupo",
        enrolledAt: "Fecha de Inscripción",
        status: "Estado",
        role: "Rol del Sistema",
        schoolName: "Institución"
      },
      alerts: {
        successCreate: "Alumno registrado exitosamente",
        successUpdate: "Perfil del alumno actualizado exitosamente",
        successDelete: "Alumno eliminado exitosamente",
        errorCreate: "Error al registrar alumno",
        errorUpdate: "Error al actualizar perfil del alumno",
        errorDelete: "Error al eliminar alumno",
        errorFetch: "Error al cargar la lista de alumnos"
      }
    },
    schoolYears: {
      title: "Ciclos Escolares",
      subtitle: "Administra los ciclos académicos y sus periodos correspondientes para cada escuela.",
      createBtn: "Nuevo Ciclo Escolar",
      noData: "No se encontraron ciclos escolares. Crea el primer ciclo académico para comenzar.",
      allSchools: "Todas las Escuelas",
      filterBySchool: "Filtrar por escuela",
      status: {
        active: "Activo",
        closed: "Cerrado"
      },
      table: {
        name: "Nombre",
        school: "Escuela",
        startDate: "Fecha Inicio",
        endDate: "Fecha Fin",
        periods: "Periodos",
        groups: "Grupos",
        status: "Estado",
        actions: "Acciones"
      },
      modal: {
        createTitle: "Crear Ciclo Escolar",
        editTitle: "Editar Ciclo Escolar",
        nameLabel: "Nombre del Ciclo (ej. 2024-2025)",
        startDateLabel: "Fecha de Inicio",
        endDateLabel: "Fecha de Fin",
        schoolLabel: "Escuela (solo Super Admin)",
        periodsSection: "Periodos (opcional)",
        addPeriod: "Agregar Periodo",
        removePeriod: "Eliminar",
        periodName: "Nombre del Periodo (ej. Trimestre 1)",
        periodStart: "Inicio del Periodo",
        periodEnd: "Fin del Periodo",
        periodOrder: "Orden",
        save: "Guardar",
        cancel: "Cancelar",
        loading: "Guardando..."
      },
      detail: {
        title: "Detalle del Ciclo Escolar",
        generalInfo: "Información General",
        periodsTitle: "Periodos",
        school: "Escuela",
        startDate: "Fecha de Inicio",
        endDate: "Fecha de Fin",
        status: "Estado",
        groups: "Grupos Asignados",
        noPeriods: "No hay periodos definidos aún.",
        addPeriod: "Agregar Periodo",
        periodName: "Nombre del Periodo",
        order: "Orden",
        closeYear: "Cerrar Ciclo Escolar",
        closeYearConfirm: "¿Estás seguro de que deseas cerrar este ciclo escolar? Esta acción no se puede deshacer.",
        deleteYear: "Eliminar Ciclo Escolar",
        deleteYearConfirm: "¿Estás seguro de que deseas eliminar este ciclo escolar? Se eliminarán también todos sus periodos."
      },
      alerts: {
        successCreate: "Ciclo escolar creado exitosamente",
        successUpdate: "Ciclo escolar actualizado exitosamente",
        successClose: "Ciclo escolar cerrado exitosamente",
        successDelete: "Ciclo escolar eliminado exitosamente",
        successAddPeriod: "Periodo agregado exitosamente",
        successDeletePeriod: "Periodo eliminado exitosamente",
        errorCreate: "Error al crear ciclo escolar",
        errorUpdate: "Error al actualizar ciclo escolar",
        errorClose: "Error al cerrar ciclo escolar",
        errorDelete: "Error al eliminar ciclo escolar",
        errorFetch: "Error al cargar los ciclos escolares",
        errorAddPeriod: "Error al agregar periodo",
        errorDeletePeriod: "Error al eliminar periodo"
      }
    },
    grades: {
      title: "Catálogo de Grados",
      subtitle: "Configura el catálogo de grados (ej. 1° Primaria, 1° Preescolar) de la unidad escolar.",
      createBtn: "Crear Grado",
      noData: "No se encontraron grados. Crea el primer grado para comenzar.",
      table: {
        name: "Nombre",
        level: "Nivel / Etapa",
        order: "Orden de Visualización",
        groups: "Grupos",
        school: "Escuela",
        actions: "Acciones"
      },
      modal: {
        createTitle: "Crear Grado",
        editTitle: "Editar Grado",
        nameLabel: "Nombre del Grado (ej. 1° Primaria)",
        levelLabel: "Nivel o Etapa Educativa",
        levelPlaceholder: "Seleccionar nivel...",
        customLevelPlaceholder: "Escribe el nivel personalizado (ej. Maternal)",
        levelSelectOptions: {
          preschool: "Preescolar",
          primary: "Primaria",
          secondary: "Secundaria",
          highschool: "Preparatoria",
          custom: "Otro / Personalizado"
        },
        orderLabel: "Orden de Clasificación",
        schoolLabel: "Escuela (solo Super Admin)",
        save: "Guardar",
        cancel: "Cancelar",
        loading: "Guardando..."
      },
      alerts: {
        successCreate: "Grado creado exitosamente",
        successUpdate: "Grado actualizado exitosamente",
        successDelete: "Grado eliminado exitosamente",
        errorCreate: "Error al crear grado",
        errorUpdate: "Error al actualizar grado",
        errorDelete: "Error al eliminar grado. Asegúrate de que no tenga grupos activos.",
        errorFetch: "Error al cargar los grados"
      }
    },
    groups: {
      title: "Directorio de Grupos",
      subtitle: "Administra los grupos escolares, su ciclo correspondiente y la vinculación de profesores.",
      createBtn: "Crear Grupo",
      noData: "No se encontraron grupos. Crea el primer grupo para comenzar.",
      table: {
        name: "Nombre de Grupo",
        grade: "Grado",
        schoolYear: "Ciclo Escolar",
        teachers: "Profesores",
        students: "Estudiantes",
        capacity: "Capacidad",
        school: "Escuela",
        actions: "Acciones"
      },
      modal: {
        createTitle: "Crear Grupo",
        editTitle: "Editar Grupo",
        nameLabel: "Nombre del Grupo (ej. A, B, 101)",
        gradeLabel: "Grado",
        schoolYearLabel: "Ciclo Escolar",
        maxStudentsLabel: "Límite Máximo de Estudiantes (opcional)",
        schoolLabel: "Escuela (solo Super Admin)",
        save: "Guardar",
        cancel: "Cancelar",
        loading: "Guardando..."
      },
      detail: {
        title: "Detalles del Grupo",
        generalTab: "Información General",
        teachersTab: "Profesores Asignados",
        studentsTab: "Estudiantes Inscritos",
        grade: "Grado",
        schoolYear: "Ciclo Escolar",
        capacity: "Capacidad Máxima",
        studentsCount: "Cantidad de Estudiantes",
        addTeacher: "Asignar Profesor",
        isHomeroom: "Profesor Titular (Homeroom)",
        noTeachers: "No hay profesores asignados a este grupo aún.",
        teacherSelectLabel: "Seleccionar Profesor",
        assignBtn: "Asignar",
        removeConfirm: "¿Estás seguro de que deseas desasignar a este profesor de este grupo?"
      },
      alerts: {
        successCreate: "Grupo creado exitosamente",
        successUpdate: "Grupo actualizado exitosamente",
        successDelete: "Grupo eliminado exitosamente",
        successAssignTeacher: "Profesor asignado al grupo exitosamente",
        successRemoveTeacher: "Profesor desasignado del grupo exitosamente",
        errorCreate: "Error al crear grupo",
        errorUpdate: "Error al actualizar grupo",
        errorDelete: "Error al eliminar grupo",
        errorAssignTeacher: "Error al asignar profesor",
        errorRemoveTeacher: "Error al desasignar profesor",
        errorFetch: "Error al cargar los grupos"
      }
    }
  }
};
