
jest.mock('antd', () => {
    const actual = jest.requireActual('antd');
    const dayjs = jest.requireActual('dayjs');


    const Button = ({
        children,
        onClick,
        htmlType = 'button',
        disabled,
        style,
        ...rest
    }: any) => (
        <button
            type={htmlType}         
            onClick={onClick}
            disabled={disabled}     
            style={style}           
            {...rest}
        >
            {children}
        </button>
    );

    const Select = (props: any) => {
        const {
            options = [],
            value,
            defaultValue,        
            onChange,
            placeholder,
            'data-testid': dataTestId,

            showSearch,
            filterSort,
            optionFilterProp,
            variant,
            size,
            style,
            labelInValue,
            mode,
            allowClear,          
            ...rest              
        } = props;

        const getInnerVal = (val: any) => {
            if (labelInValue) {
                if (Array.isArray(val)) return val.map(v => (typeof v === 'object' ? v.value : v));
                return typeof val === 'object' && val !== null ? val.value : val;
            }
            return val;
        };

        const toDom = (inner: any) =>
            Array.isArray(inner)
                ? inner.map(v => (typeof v === 'number' ? String(v) : v ?? ''))
                : (typeof inner === 'number' ? String(inner) : inner ?? '');

        const innerVal = getInnerVal(value);
        const domValue = toDom(innerVal);

        const innerDefault = getInnerVal(defaultValue);
        const domDefault = toDom(innerDefault);

        const isControlled = value !== undefined;

        const handleChange = (raw: string | string[]) => {
            const toNumber = (r: string) =>
                r !== '' && /^-?\d+(\.\d+)?$/.test(r) ? Number(r) : r;

            if (Array.isArray(raw)) {
                const parsedArray = raw.map(r => toNumber(r as string));
                const matchedArray = parsedArray.map(p =>
                    options.find((o: any) => String(o.value) === String(p)) ?? null
                );

                if (labelInValue) {
                    const labelled = matchedArray.map((opt: any, i: number) =>
                        opt ? { value: opt.value, label: opt.label } : { value: parsedArray[i], label: String(parsedArray[i]) }
                    );
                    onChange?.(labelled, matchedArray);
                } else {
                    onChange?.(parsedArray, matchedArray);
                }
                return;
            }

            const parsed = toNumber(raw as string);
            const matched = options.find((o: any) => String(o.value) === String(parsed)) ?? null;

            if (labelInValue) {
                const labelled = matched
                    ? { value: matched.value, label: matched.label }
                    : { value: parsed, label: String(parsed) };
                onChange?.(labelled, matched);
            } else {
                onChange?.(parsed, matched);
            }
        };

        const multiple = mode === 'multiple' || mode === 'tags';

        return (
            <select
                aria-label={placeholder || 'select'}
                data-testid={dataTestId || 'antd-select'}
                {...(isControlled
                    ? { value: domValue as any }
                    : defaultValue !== undefined
                        ? { defaultValue: domDefault as any }
                        : {})}
                onChange={(e) => handleChange(multiple
                    ? Array.from(e.target.selectedOptions).map(o => (o as HTMLOptionElement).value)
                    : e.target.value)}
                multiple={multiple}
                {...rest}
            >
                {!multiple && allowClear ? <option value="" /> : null}
                {options.map((o: any) => (
                    <option key={String(o.value)} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        );
    };
    // DatePicker -> input[type=date] que chama onChange com dayjs
    const DatePicker = (props: any) => {
        const {
            value,
            onChange,
            placeholder,
            'data-testid': dataTestId,
            ...rest
        } = props;

        const strValue =
            value?.isValid?.() ? value.format('YYYY-MM-DD') :
                (typeof value === 'string' ? value : '');

        return (
            <input
                aria-label={placeholder || 'date'}
                data-testid={dataTestId || 'antd-date'}
                type="date"
                value={strValue}
                onChange={(e) => {
                    const d = dayjs(e.target.value);
                    onChange?.(d, e.target.value);
                }}
                {...rest}
            />
        );
    };

    const InputNumber = (props: any) => {
        const { value, onChange, min, max, step, placeholder, 'data-testid': dataTestId, ...rest } = props;
        return (
            <input
                data-testid={dataTestId || 'antd-number'}
                type="number"
                value={value ?? ''}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                onChange={(e) => {
                    const v = e.target.value === '' ? null : Number(e.target.value);
                    onChange?.(Number.isFinite(v as number) ? (v as number) : null);
                }}
                {...rest}
            />
        );
    };

    return {
        ...actual,
        Select,
        DatePicker,
        InputNumber,
        Button
    };
});

jest.mock('../../components/geral/Loading', () => ({
    __esModule: true,
    default: () => null,
}));