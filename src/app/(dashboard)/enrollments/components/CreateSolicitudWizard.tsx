import React, { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Plus,
} from "lucide-react";
import api from "@/lib/api/axios";

interface WizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSolicitudWizard({
  onClose,
  onSuccess,
}: WizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [docTypes, setDocTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesRes, groupsRes, docsRes] = await Promise.all([
          api.get("/academic/grades"),
          api.get("/academic/groups"),
          api.get("/enrollments/tipos-documento"),
        ]);
        setGrades(gradesRes.data?.data || []);
        setGroups(groupsRes.data?.data || []);
        setDocTypes(docsRes.data?.data || []);
      } catch (err) {
        console.error("Error fetching academic data", err);
      }
    };
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    tipoSolicitud: "INSCRIPCION",
    alumnos: [
      {
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        gradeId: "",
        groupId: "",
        documentos: {} as Record<string, File>,
      },
    ],
    padres: [
      {
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        email: "",
        relationship: "Padre",
        isPrimary: true,
      },
    ],
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (formData.alumnos.some((alumno) => !alumno.gradeId || !alumno.groupId)) {
      alert("Selecciona grado y grupo para cada alumno antes de crear la solicitud.");
      return;
    }

    try {
      setLoading(true);

      const payloadBase = {
        tipoSolicitud: formData.tipoSolicitud,
        padres: formData.padres,
      };

      for (const alumno of formData.alumnos) {
        const payload = {
          ...payloadBase,
          primerNombre: alumno.primerNombre,
          segundoNombre: alumno.segundoNombre,
          primerApellido: alumno.primerApellido,
          segundoApellido: alumno.segundoApellido,
          gradeId: alumno.gradeId,
          groupId: alumno.groupId,
        };

        const res = await api.post("/enrollments", payload);
        const solicitudId = res.data?.data?.id;

        if (solicitudId && alumno.documentos) {
          for (const [tipoId, file] of Object.entries(alumno.documentos)) {
            if (file) {
              const formDataUpload = new FormData();
              formDataUpload.append("tipoDocumentoId", tipoId);
              formDataUpload.append("file", file);
              await api.post(
                `/enrollments/${solicitudId}/documents`,
                formDataUpload,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                },
              );
            }
          }
        }
      }

      onSuccess();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-3xl rounded-2xl shadow-main animate-slide-up flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
          <h2 className="text-xl font-bold gradient-text">
            Nueva Solicitud de Inscripción
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-between px-8 py-4 border-b border-[var(--border-glass)] bg-[var(--bg-surface)]/50">
          {["Tipo", "Alumno", "Tutores", "Documentos", "Resumen"].map(
            (lbl, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > i + 1
                      ? "bg-[var(--accent-primary)] text-white shadow-glow"
                      : step === i + 1
                        ? "border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                        : "border-2 border-[var(--border-glass)] text-[var(--text-muted)]"
                  }`}
                >
                  {step > i + 1 ? <Check size={16} /> : i + 1}
                </div>
                <span
                  className={`text-xs ${step >= i + 1 ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)]"}`}
                >
                  {lbl}
                </span>
              </div>
            ),
          )}
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Tipo de Solicitud</h3>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Selecciona la modalidad de ingreso
                </label>
                <select
                  className="glass-input w-full"
                  value={formData.tipoSolicitud}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoSolicitud: e.target.value })
                  }
                >
                  <option value="INSCRIPCION" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    Nuevo Ingreso
                  </option>
                  <option value="REINSCRIPCION" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    Reinscripción
                  </option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Datos del Alumno</h3>
                <button
                  onClick={() => {
                    const firstStudent = formData.alumnos[0];
                    setFormData({
                      ...formData,
                      alumnos: [
                        ...formData.alumnos,
                        {
                          primerNombre: "",
                          segundoNombre: "",
                          primerApellido: firstStudent?.primerApellido || "",
                          segundoApellido: firstStudent?.segundoApellido || "",
                          gradeId: "",
                          groupId: "",
                          documentos: {} as Record<string, File>,
                        },
                      ],
                    });
                  }}
                  className="glass-button text-xs py-1.5 px-3"
                >
                  <Plus size={14} /> Añadir Alumno
                </button>
              </div>

              {formData.alumnos.map((alumno, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50 space-y-4 relative"
                >
                  {formData.alumnos.length > 1 && (
                    <button
                      onClick={() => {
                        const newAlumnos = [...formData.alumnos];
                        newAlumnos.splice(index, 1);
                        setFormData({ ...formData, alumnos: newAlumnos });
                      }}
                      className="absolute top-3 right-3 p-1 text-[var(--text-muted)] hover:text-[hsl(354,85%,60%)] transition-colors"
                      title="Eliminar Alumno"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <h4 className="text-sm font-semibold text-[var(--accent-primary)]">
                    Alumno {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Primer Nombre
                      </label>
                      <input
                        className="glass-input w-full"
                        placeholder="Ej. Juan"
                        value={alumno.primerNombre}
                        onChange={(e) => {
                          const newAlumnos = [...formData.alumnos];
                          newAlumnos[index].primerNombre = e.target.value;
                          setFormData({ ...formData, alumnos: newAlumnos });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Segundo Nombre (Opcional)
                      </label>
                      <input
                        className="glass-input w-full"
                        placeholder="Ej. Carlos"
                        value={alumno.segundoNombre}
                        onChange={(e) => {
                          const newAlumnos = [...formData.alumnos];
                          newAlumnos[index].segundoNombre = e.target.value;
                          setFormData({ ...formData, alumnos: newAlumnos });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Primer Apellido
                      </label>
                      <input
                        className="glass-input w-full"
                        placeholder="Ej. Pérez"
                        value={alumno.primerApellido}
                        onChange={(e) => {
                          const newAlumnos = [...formData.alumnos];
                          newAlumnos[index].primerApellido = e.target.value;
                          setFormData({ ...formData, alumnos: newAlumnos });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Segundo Apellido
                      </label>
                      <input
                        className="glass-input w-full"
                        placeholder="Ej. López"
                        value={alumno.segundoApellido}
                        onChange={(e) => {
                          const newAlumnos = [...formData.alumnos];
                          newAlumnos[index].segundoApellido = e.target.value;
                          setFormData({ ...formData, alumnos: newAlumnos });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Grado
                      </label>
                      <select
                        className="glass-input w-full"
                        value={alumno.gradeId}
                        required
                        onChange={(e) => {
                          const newAlumnos = [...formData.alumnos];
                          newAlumnos[index].gradeId = e.target.value;
                          newAlumnos[index].groupId = "";
                          setFormData({ ...formData, alumnos: newAlumnos });
                        }}
                      >
                        <option value="" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                          Selecciona un grado...
                        </option>
                        {grades.map((g) => (
                          <option
                            key={g.id}
                            value={g.id}
                            className="bg-[var(--bg-surface)] text-[var(--text-primary)]"
                          >
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Grupo
                      </label>
                      <select
                        className="glass-input w-full"
                        value={alumno.groupId}
                        required
                        onChange={(e) => {
                          const newAlumnos = [...formData.alumnos];
                          newAlumnos[index].groupId = e.target.value;
                          setFormData({ ...formData, alumnos: newAlumnos });
                        }}
                        disabled={!alumno.gradeId}
                      >
                        <option value="" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                          Selecciona un grupo...
                        </option>
                        {groups
                          .filter((g) => g.gradeId === alumno.gradeId)
                          .map((g) => {
                            const count = g._count?.enrollments || 0;
                            const capacity =
                              g.maxStudents !== null &&
                              g.maxStudents !== undefined
                                ? g.maxStudents - count
                                : null;
                            const capText =
                              capacity !== null
                                ? `${capacity} lugares disp.`
                                : "Ilimitado";
                            return (
                              <option
                                key={g.id}
                                value={g.id}
                                className="bg-[var(--bg-surface)] text-[var(--text-primary)]"
                              >
                                {g.name} ({capText})
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Datos de los Tutores</h3>
                {formData.padres.length < 4 && (
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        padres: [
                          ...formData.padres,
                          {
                            primerNombre: "",
                            segundoNombre: "",
                            primerApellido: "",
                            segundoApellido: "",
                            email: "",
                            relationship: "Padre",
                            isPrimary: false,
                          },
                        ],
                      });
                    }}
                    className="glass-button text-xs py-1.5 px-3"
                  >
                    <Plus size={14} /> Añadir Tutor
                  </button>
                )}
              </div>

              {formData.padres.map((padre, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50 space-y-4 relative"
                >
                  {formData.padres.length > 1 && (
                    <button
                      onClick={() => {
                        const newPadres = [...formData.padres];
                        newPadres.splice(index, 1);
                        if (padre.isPrimary && newPadres.length > 0) {
                          newPadres[0].isPrimary = true;
                        }
                        setFormData({ ...formData, padres: newPadres });
                      }}
                      className="absolute top-3 right-3 p-1 text-[var(--text-muted)] hover:text-[hsl(354,85%,60%)] transition-colors"
                      title="Eliminar Tutor"
                    >
                      <X size={16} />
                    </button>
                  )}

                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-[var(--accent-secondary)]">
                      Tutor {index + 1}
                    </h4>
                    <label className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="primaryTutor"
                        checked={padre.isPrimary}
                        onChange={() => {
                          const newPadres = formData.padres.map((p, i) => ({
                            ...p,
                            isPrimary: i === index,
                          }));
                          setFormData({ ...formData, padres: newPadres });
                        }}
                        className="accent-[var(--accent-primary)]"
                      />
                      Tutor Principal (Acceso a Plataforma)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Primer Nombre
                      </label>
                      <input
                        className="glass-input w-full"
                        placeholder="Ej. María"
                        value={padre.primerNombre}
                        onChange={(e) => {
                          const newPadres = [...formData.padres];
                          newPadres[index].primerNombre = e.target.value;
                          setFormData({ ...formData, padres: newPadres });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Segundo Nombre (Opcional)
                      </label>
                      <input
                        className="glass-input w-full"
                        placeholder="Ej. Elena"
                        value={padre.segundoNombre}
                        onChange={(e) => {
                          const newPadres = [...formData.padres];
                          newPadres[index].segundoNombre = e.target.value;
                          setFormData({ ...formData, padres: newPadres });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Primer Apellido
                      </label>
                      <input
                        className="glass-input w-full"
                        placeholder="Ej. García"
                        value={padre.primerApellido}
                        onChange={(e) => {
                          const newPadres = [...formData.padres];
                          newPadres[index].primerApellido = e.target.value;
                          setFormData({ ...formData, padres: newPadres });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Segundo Apellido
                      </label>
                      <input
                        className="glass-input w-full"
                        placeholder="Ej. López"
                        value={padre.segundoApellido}
                        onChange={(e) => {
                          const newPadres = [...formData.padres];
                          newPadres[index].segundoApellido = e.target.value;
                          setFormData({ ...formData, padres: newPadres });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Email
                      </label>
                      <input
                        className="glass-input w-full"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={padre.email}
                        onChange={(e) => {
                          const newPadres = [...formData.padres];
                          newPadres[index].email = e.target.value;
                          setFormData({ ...formData, padres: newPadres });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Parentesco
                      </label>
                      <select
                        className="glass-input w-full"
                        value={padre.relationship}
                        onChange={(e) => {
                          const newPadres = [...formData.padres];
                          newPadres[index].relationship = e.target.value;
                          setFormData({ ...formData, padres: newPadres });
                        }}
                      >
                        <option value="Padre" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                          Padre
                        </option>
                        <option value="Madre" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                          Madre
                        </option>
                        <option value="Tutor" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                          Tutor Legal
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Subir Documentos (Opcional)</h3>
              {docTypes.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  No hay tipos de documentos configurados.
                </p>
              ) : (
                <div className="space-y-6">
                  {formData.alumnos.map((alumno, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50 space-y-4"
                    >
                      <h4 className="text-sm font-semibold text-[var(--accent-primary)]">
                        Documentos:{" "}
                        {[
                          alumno.primerNombre,
                          alumno.segundoNombre,
                          alumno.primerApellido,
                          alumno.segundoApellido,
                        ]
                          .filter(Boolean)
                          .join(" ") || `Alumno ${index + 1}`}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {docTypes.map((docType) => (
                          <div key={docType.id} className="space-y-1.5">
                            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                              {docType.nombre}
                            </label>
                            <input
                              type="file"
                              className="block w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent-primary)] file:text-white hover:file:bg-[var(--accent-secondary)] transition-all cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const newAlumnos = [...formData.alumnos];
                                  newAlumnos[index].documentos = {
                                    ...newAlumnos[index].documentos,
                                    [docType.id]: file,
                                  };
                                  setFormData({
                                    ...formData,
                                    alumnos: newAlumnos,
                                  });
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Resumen de Solicitud</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50">
                  <h4 className="text-sm font-bold text-[var(--accent-primary)] mb-2">
                    Alumnos
                  </h4>
                  {formData.alumnos.map((alumno, i) => (
                    <div
                      key={i}
                      className="mb-3 border-b border-[var(--border-glass)] last:border-0 pb-3 last:pb-0 text-sm"
                    >
                      <p>
                        <span className="text-[var(--text-secondary)] font-medium">
                          Nombre:
                        </span>{" "}
                        <span className="text-[var(--text-primary)] font-semibold">
                          {[
                            alumno.primerNombre,
                            alumno.segundoNombre,
                            alumno.primerApellido,
                            alumno.segundoApellido,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </span>
                      </p>
                      <p>
                        <span className="text-[var(--text-secondary)] font-medium">
                          Grado:
                        </span>{" "}
                        <span className="text-[var(--text-primary)]">
                          {grades.find((g) => g.id === alumno.gradeId)?.name ||
                            "No seleccionado"}
                        </span>
                      </p>
                      <p>
                        <span className="text-[var(--text-secondary)] font-medium">
                          Grupo:
                        </span>{" "}
                        <span className="text-[var(--text-primary)]">
                          {groups.find((g) => g.id === alumno.groupId)?.name ||
                            "No seleccionado"}
                        </span>
                      </p>
                      <p>
                        <span className="text-[var(--text-secondary)] font-medium">
                          Documentos adjuntos:
                        </span>{" "}
                        <span className="text-[var(--text-primary)] font-medium">
                          {Object.keys(alumno.documentos || {}).length}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50">
                  <h4 className="text-sm font-bold text-[var(--accent-secondary)] mb-2">
                    Tutores
                  </h4>
                  {formData.padres.map((padre, i) => (
                    <div
                      key={i}
                      className="mb-3 border-b border-[var(--border-glass)] last:border-0 pb-3 last:pb-0 text-sm"
                    >
                      <p>
                        <span className="text-[var(--text-secondary)] font-medium">
                          Nombre:
                        </span>{" "}
                        <span className="text-[var(--text-primary)] font-semibold">
                          {[
                            padre.primerNombre,
                            padre.segundoNombre,
                            padre.primerApellido,
                            padre.segundoApellido,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </span>
                        {padre.isPrimary && (
                          <span className="ml-2 text-[10px] uppercase font-bold bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded-full shadow-glow">
                            Principal
                          </span>
                        )}
                      </p>
                      <p>
                        <span className="text-[var(--text-secondary)] font-medium">
                          Email:
                        </span>{" "}
                        <span className="text-[var(--text-primary)]">{padre.email}</span>
                      </p>
                      <p>
                        <span className="text-[var(--text-secondary)] font-medium">
                          Parentesco:
                        </span>{" "}
                        <span className="text-[var(--text-primary)]">{padre.relationship}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[var(--border-glass)] flex justify-between items-center bg-[var(--bg-surface)]/30 rounded-b-2xl">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`glass-button-secondary flex items-center gap-2 ${step === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          {step < 5 ? (
            <button
              onClick={nextStep}
              className="glass-button flex items-center gap-2"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="glass-button flex items-center gap-2 shadow-glow"
            >
              {loading ? "Procesando..." : "Confirmar Solicitud"}{" "}
              <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
