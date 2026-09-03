import React, { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import IntlNumberInput from "./index";

describe("IntlNumberInput", () => {
  test("renders default masked value", () => {
    render(<IntlNumberInput />);
    expect(screen.getByRole("spinbutton")).toHaveValue("0.00");
  });

  test("formats initial value from props", () => {
    render(<IntlNumberInput value={1234.56} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("1,234.56");
  });

  test("calls onChange with numeric and masked values", () => {
    const onChange = jest.fn();
    render(<IntlNumberInput onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "1234" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toBe(12.34);
    expect(onChange.mock.calls[0][2]).toBe("12.34");
  });

  test("handles negative values", () => {
    render(<IntlNumberInput value={-100} precision={0} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("-100");
  });

  test("respects minValue constraint", () => {
    const onChange = jest.fn();
    render(
      <IntlNumberInput
        value={50}
        minValue={10}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "5" } });

    const call = onChange.mock.calls[0];
    expect(call[1]).toBe(10);
  });

  test("respects maxValue constraint", () => {
    const onChange = jest.fn();
    render(
      <IntlNumberInput
        value={50}
        precision={2}
        maxValue={100}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "10100" } });

    const call = onChange.mock.calls[0];
    expect(call[1]).toBe(100);
  });

  test("handles precision 0", () => {
    render(<IntlNumberInput value={1234} precision={0} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("1,234");
  });

  test("renders with prefix and suffix", () => {
    render(
      <IntlNumberInput
        value={100}
        prefix="$ "
        suffix=" BRL"
        precision={2}
      />
    );
    expect(screen.getByRole("spinbutton")).toHaveValue("$ 100.00 BRL");
  });

  test("disables input when disabled prop is true", () => {
    render(<IntlNumberInput disabled />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  test("renders step buttons when showStepButtons is true", () => {
    render(<IntlNumberInput showStepButtons />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  test("increments value when plus button is clicked", () => {
    const onChange = jest.fn();
    render(
      <IntlNumberInput
        value={10}
        precision={0}
        showStepButtons
        onChange={onChange}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toBe(11);
  });

  test("decrements value when minus button is clicked", () => {
    const onChange = jest.fn();
    render(
      <IntlNumberInput
        value={10}
        precision={0}
        showStepButtons
        onChange={onChange}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toBe(9);
  });

  test("clamps step button values to min/max", () => {
    const onChange = jest.fn();
    render(
      <IntlNumberInput
        value={10}
        precision={0}
        minValue={0}
        maxValue={10}
        showStepButtons
        onChange={onChange}
      />
    );

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[0]);
    expect(onChange.mock.calls[onChange.mock.calls.length - 1][1]).toBe(9);

    fireEvent.click(buttons[1]);
    expect(onChange.mock.calls[onChange.mock.calls.length - 1][1]).toBe(10);
  });

  test("handles pt-BR locale formatting", () => {
    render(<IntlNumberInput value={1234.56} locale="pt-BR" />);
    expect(screen.getByRole("spinbutton")).toHaveValue("1.234,56");
  });

  test("calls onBlur with formatted value", () => {
    const onBlur = jest.fn();
    render(<IntlNumberInput onBlur={onBlur} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "1234" } });
    fireEvent.blur(input);

    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onBlur.mock.calls[0][1]).toBe(12.34);
    expect(onBlur.mock.calls[0][2]).toBe("12.34");
  });

  test("clamps onBlur numeric value to minValue", () => {
    const onBlur = jest.fn();
    render(
      <IntlNumberInput
        value={50}
        minValue={10}
        onBlur={onBlur}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.blur(input, { target: { value: "5" } });

    expect(onBlur.mock.calls[0][1]).toBe(10);
    expect(onBlur.mock.calls[0][2]).toBe("10.00");
  });

  test("clamps onBlur numeric value to maxValue", () => {
    const onBlur = jest.fn();
    render(
      <IntlNumberInput
        value={50}
        precision={0}
        maxValue={100}
        onBlur={onBlur}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.blur(input, { target: { value: "200" } });

    expect(onBlur.mock.calls[0][1]).toBe(100);
    expect(onBlur.mock.calls[0][2]).toBe("100");
  });

  test("reformats display value on blur", () => {
    render(<IntlNumberInput value={0} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "1234" } });
    fireEvent.blur(input);

    expect(input).toHaveValue("12.34");
  });

  test("respects inputMode prop override", () => {
    render(<IntlNumberInput inputMode="numeric" precision={2} />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("inputmode", "numeric");
  });

  test("falls back to en-US for invalid locale", () => {
    render(<IntlNumberInput value={1234.56} locale="invalid-locale" />);
    expect(screen.getByRole("spinbutton")).toHaveValue("1,234.56");
  });

  test("sanitizes prefix and suffix", () => {
    render(
      <IntlNumberInput
        value={100}
        prefix={'<script>alert("x")</script>'}
        suffix={'<img onerror="alert(1)">'}
        precision={2}
      />
    );
    expect(screen.getByRole("spinbutton")).toHaveValue('alert("x")100.00');
    expect(screen.getByRole("spinbutton").value).not.toContain("<script>");
  });

  test("renders input directly when step buttons are hidden", () => {
    const { container } = render(<IntlNumberInput />);
    expect(container.querySelector("div")).toBeNull();
    expect(container.querySelector("input")).not.toBeNull();
  });

  test("swaps min and max when minValue is greater than maxValue", () => {
    const onChange = jest.fn();
    render(
      <IntlNumberInput
        value={50}
        precision={0}
        minValue={100}
        maxValue={10}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "200" } });

    expect(onChange.mock.calls[0][1]).toBe(100);
  });

  test("updates display when controlled value prop changes", () => {
    const { rerender } = render(<IntlNumberInput value={10} precision={0} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("10");

    rerender(<IntlNumberInput value={25} precision={0} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("25");
  });

  test("forwards ref to the underlying input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<IntlNumberInput ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.tagName).toBe("INPUT");
  });

  test("forwards standard input attributes", () => {
    const onFocus = jest.fn();
    render(
      <IntlNumberInput
        aria-label="Amount"
        autoComplete="off"
        onFocus={onFocus}
      />
    );

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("aria-label", "Amount");
    expect(input).toHaveAttribute("autocomplete", "off");

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  test("disables step buttons when disabled prop is true", () => {
    render(<IntlNumberInput showStepButtons disabled />);
    const buttons = screen.getAllByRole("button");

    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  test("falls back to step 1 for invalid step values", () => {
    const onChange = jest.fn();
    render(
      <IntlNumberInput
        value={10}
        precision={0}
        step={-5}
        showStepButtons
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onChange.mock.calls[0][1]).toBe(11);
  });

  test("increments by step with decimal precision", () => {
    const onChange = jest.fn();
    render(
      <IntlNumberInput
        value={12.34}
        precision={2}
        step={1}
        showStepButtons
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onChange.mock.calls[0][1]).toBe(12.35);
  });

  describe("renderControls", () => {
    test("renders custom controls when renderControls is provided", () => {
      render(
        <IntlNumberInput
          value={100}
          renderControls={({ value }) => (
            <div data-testid="custom-controls">
              <span>Value: {value}</span>
            </div>
          )}
        />
      );

      expect(screen.getByTestId("custom-controls")).toBeInTheDocument();
      expect(screen.getByText("Value: 100")).toBeInTheDocument();
    });

    test("renders input as sibling without wrapper element", () => {
      const { container } = render(
        <IntlNumberInput
          value={100}
          renderControls={() => <div data-testid="controls" />}
        />
      );

      expect(container.querySelector("div")?.dataset.testid).toBe("controls");
      expect(container.querySelector("input")).not.toBeNull();
    });

    test("renderControls takes precedence over showStepButtons", () => {
      render(
        <IntlNumberInput
          value={100}
          showStepButtons
          renderControls={() => <div data-testid="custom-controls" />}
        />
      );

      expect(screen.getByTestId("custom-controls")).toBeInTheDocument();
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });

    test("increment callback increases value", () => {
      const onChange = jest.fn();
      render(
        <IntlNumberInput
          value={100}
          precision={0}
          renderControls={({ increment }) => (
            <button onClick={() => increment()}>+</button>
          )}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onChange.mock.calls[0][1]).toBe(101);
    });

    test("decrement callback decreases value", () => {
      const onChange = jest.fn();
      render(
        <IntlNumberInput
          value={100}
          precision={0}
          renderControls={({ decrement }) => (
            <button onClick={() => decrement()}>-</button>
          )}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onChange.mock.calls[0][1]).toBe(99);
    });

    test("setValue callback sets specific value", () => {
      const onChange = jest.fn();
      render(
        <IntlNumberInput
          value={100}
          precision={0}
          renderControls={({ setValue }) => (
            <button onClick={() => setValue(50)}>Set 50</button>
          )}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onChange.mock.calls[0][1]).toBe(50);
    });

    test("increment with multiplier works", () => {
      const onChange = jest.fn();
      render(
        <IntlNumberInput
          value={100}
          precision={0}
          renderControls={({ increment }) => (
            <button onClick={() => increment(10)}>+10</button>
          )}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onChange.mock.calls[0][1]).toBe(110);
    });

    test("decrement with multiplier works", () => {
      const onChange = jest.fn();
      render(
        <IntlNumberInput
          value={100}
          precision={0}
          renderControls={({ decrement }) => (
            <button onClick={() => decrement(10)}>-10</button>
          )}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onChange.mock.calls[0][1]).toBe(90);
    });

    test("controls respect minValue and maxValue", () => {
      const onChange = jest.fn();
      render(
        <IntlNumberInput
          value={1}
          precision={0}
          minValue={0}
          maxValue={10}
          renderControls={({ increment, decrement }) => (
            <div>
              <button onClick={() => decrement()}>-</button>
              <button onClick={() => increment()}>+</button>
            </div>
          )}
          onChange={onChange}
        />
      );

      const buttons = screen.getAllByRole("button");

      fireEvent.click(buttons[0]);
      expect(onChange.mock.calls[onChange.mock.calls.length - 1][1]).toBe(0);

      fireEvent.click(buttons[1]);
      expect(onChange.mock.calls[onChange.mock.calls.length - 1][1]).toBe(1);

      fireEvent.click(buttons[1]);
      expect(onChange.mock.calls[onChange.mock.calls.length - 1][1]).toBe(2);
    });

    test("controls have access to formattedValue", () => {
      render(
        <IntlNumberInput
          value={1234.56}
          renderControls={({ formattedValue }) => (
            <div data-testid="formatted">{formattedValue}</div>
          )}
        />
      );

      expect(screen.getByTestId("formatted")).toHaveTextContent("1,234.56");
    });

    test("controls receive disabled state", () => {
      render(
        <IntlNumberInput
          value={100}
          disabled
          renderControls={({ disabled: isDisabled }) => (
            <div data-testid="disabled">Disabled: {String(isDisabled)}</div>
          )}
        />
      );

      expect(screen.getByTestId("disabled")).toHaveTextContent("Disabled: true");
    });

    test("controls do not change value when disabled", () => {
      const onChange = jest.fn();
      render(
        <IntlNumberInput
          value={100}
          precision={0}
          disabled
          renderControls={({ increment }) => (
            <button onClick={() => increment()}>+</button>
          )}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onChange).not.toHaveBeenCalled();
    });

    test("controls receive step and precision values", () => {
      render(
        <IntlNumberInput
          value={100}
          precision={2}
          step={5}
          renderControls={({ step, precision }) => (
            <div data-testid="params">
              Step: {step}, Precision: {precision}
            </div>
          )}
        />
      );

      expect(screen.getByTestId("params")).toHaveTextContent("Step: 5, Precision: 2");
    });

    test("controls receive effective min and max bounds", () => {
      render(
        <IntlNumberInput
          value={50}
          minValue={10}
          maxValue={100}
          renderControls={({ min, max }) => (
            <div data-testid="bounds">
              Min: {min}, Max: {max}
            </div>
          )}
        />
      );

      expect(screen.getByTestId("bounds")).toHaveTextContent("Min: 10, Max: 100");
    });

    test("increment with decimal precision uses step correctly", () => {
      const onChange = jest.fn();
      render(
        <IntlNumberInput
          value={12.34}
          precision={2}
          step={1}
          renderControls={({ increment }) => (
            <button onClick={() => increment()}>+</button>
          )}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onChange.mock.calls[0][1]).toBe(12.35);
    });
  });
});

