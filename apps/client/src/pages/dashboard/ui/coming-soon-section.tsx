type ComingSoonSectionProps = {
  title: string;
  subTitle?: string;
  body: string;
};

const ComingSoonSection = ({ title, subTitle, body }: ComingSoonSectionProps) => {
  return (
    <section className="mb-14">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="m-0 font-sans text-lg font-medium tracking-[-0.005em] text-foreground">
          {title}
          {subTitle ? (
            <span className="ml-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-fg-dim">
              {subTitle}
            </span>
          ) : null}
        </h2>
      </div>
      <div className="flex items-center justify-center border border-hairline bg-black/10 py-12 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
        {body}
      </div>
    </section>
  );
};

export { ComingSoonSection };
