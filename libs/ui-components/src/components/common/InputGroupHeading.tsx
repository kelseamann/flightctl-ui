import * as React from 'react';

type InputGroupHeadingProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  isRequired?: boolean;
};

/** Body/default/semibold typography for text above an input group. */
const InputGroupHeading = ({ children, className, id, isRequired }: InputGroupHeadingProps) => (
  <div
    id={id}
    className={['pf-v6-c-form__label', 'pf-v6-u-mb-sm', className].filter(Boolean).join(' ')}
    style={{
      fontSize: 'var(--pf-t--global--font--size--body--default)',
      lineHeight: 'var(--pf-t--global--font--line-height--body)',
    }}
  >
    <span className="pf-v6-c-form__label-text pf-v6-u-font-weight-bold">{children}</span>
    {isRequired && (
      <span className="pf-v6-c-form__label-required" aria-hidden="true">
        {' *'}
      </span>
    )}
  </div>
);

export default InputGroupHeading;
