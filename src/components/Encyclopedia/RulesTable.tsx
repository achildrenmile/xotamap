import { useI18n } from '../../i18n';
import type { ProgramRules } from '../../types/program';

interface RulesTableProps {
  rules: ProgramRules;
}

export default function RulesTable({ rules }: RulesTableProps) {
  const { t } = useI18n();

  const rows: Array<{ label: string; value: string | undefined }> = [
    { label: t.minQsos, value: rules.minQsos != null ? String(rules.minQsos) : undefined },
    { label: t.activationRadius, value: rules.activationRadius },
    { label: t.equipment, value: rules.equipment },
    {
      label: t.operatingModes,
      value: rules.operatingModes?.length ? rules.operatingModes.join(', ') : undefined,
    },
    { label: t.specialRequirements, value: rules.specialRequirements },
  ].filter((row) => row.value != null);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th
              colSpan={2}
              className="px-5 py-3 text-left text-base font-semibold text-gray-800 dark:text-gray-200"
            >
              {t.rulesTitle}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {rows.map(({ label, value }) => (
            <tr
              key={label}
              className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className="px-5 py-3 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap w-1/3 align-top">
                {label}
              </td>
              <td className="px-5 py-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
