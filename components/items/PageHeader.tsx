interface PageHeaderProps {
  title: string;
  total?: number | string;
  description?: string;
}

export function PageHeader({ title, total, description }: PageHeaderProps) {
  return (
    <div className="relative pb-6 border-b border-border/50">
      {/* Left accent bar */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full bg-primary" />

      <div className="pl-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight leading-none">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1.5">{description}</p>
          )}
        </div>
        {total !== undefined && (
          <span className="text-sm text-muted-foreground pb-0.5 font-medium flex-shrink-0">
            {typeof total === 'number' ? total.toLocaleString('es') : total} títulos
          </span>
        )}
      </div>
    </div>
  );
}
