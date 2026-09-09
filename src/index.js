/**
 * @gratora/ui — public barrel.
 *
 * Components are compiled to dist/ on publish. Import from the package root:
 *
 *   import { Btn, Card, MetricCard } from '@gratora/ui';
 *
 * SCSS lives under `@gratora/ui/scss/*` and is imported from page-level
 * stylesheets, not from here.
 */

/* ----------------------------------------------------------------- components */
export { default as AmountInput } from './components/AmountInput';
export { default as BoxControl } from './components/BoxControl';
export { default as Btn } from './components/Btn';
export { default as Card } from './components/Card';
export { default as Collapsible } from './components/Collapsible';
export { default as ColorInput } from './components/ColorInput';
export { default as CountrySelect } from './components/CountrySelect';
export { default as CoverImagePicker } from './components/CoverImagePicker';
export { default as DateField } from './components/DateField';
export { default as MonthField } from './components/MonthField';
export { default as Dialog } from './components/Dialog';
export { default as Drawer } from './components/Drawer';
export { default as EmptyState } from './components/EmptyState';
export { default as Field } from './components/Field';
export { default as FormRow } from './components/FormRow';
export { default as Icon, ICONS } from './components/Icon';
export { default as KeyField } from './components/KeyField';
export { default as Notice } from './components/Notice';
export { default as NumberWithUnit } from './components/NumberWithUnit';
export { default as SearchableSelect } from './components/SearchableSelect';
export { default as SectionBar } from './components/SectionBar';
export { default as Segmented } from './components/Segmented';
export { default as SettingsSection } from './components/SettingsSection';
export { default as Slider } from './components/Slider';
export { default as StatusBadge, STATUS_LABEL, STATUS_COLORS } from './components/StatusBadge';
export { default as Switch, ToggleRow } from './components/Switch';
export { default as Toaster } from './components/Toaster';

/* -------------------------------------------------------------------- widgets */
export { default as ChannelBreakdown } from './widgets/ChannelBreakdown';
export { default as LayoutControls } from './widgets/LayoutControls';
export { default as MetricCard, ComparisonBadge } from './widgets/MetricCard';
export { default as RevenueChart } from './widgets/RevenueChart';
export { default as Widget, WidgetCard } from './widgets/Widget';
export { default as WidgetGrid } from './widgets/WidgetGrid';
// widgets/SectionBar is the dashboard range bar — distinct from the primitive
// SectionBar above, so it's exported under a clearer name.
export { default as DashboardSectionBar, RANGE_OPTIONS } from './widgets/SectionBar';
export * from './widgets/icons';

/* -------------------------------------------------------------------- styling */
export { default as StylePreview, resolveEffectiveTokens, resolveEffectiveStyle } from './styling/StylePreview';
export { default as TokenEditor } from './styling/TokenEditor';

/* ---------------------------------------------------------------------- utils */
export * from './utils/format';
export * from './utils/currency';
export * from './utils/countries';
export { notify, subscribe, dismiss } from './utils/notify';
