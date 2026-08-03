import ModuleGuard from "@/components/shared/ModuleGuard";
import EvaluationCategoriesCatalog from "@/modules/grades/components/EvaluationCategoriesCatalog";

export default function EvaluationCategoriesCatalogPage() {
  return (
    <ModuleGuard moduleKey="grades" requireSchoolContext={true}>
      <EvaluationCategoriesCatalog />
    </ModuleGuard>
  );
}
