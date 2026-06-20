import React, { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import IntlNumberInput from "./index";

describe("IntlNumberInput", () => {
  test("renders default masked value", () => {
    render(<IntlNumberInput />);
    expect(screen.getByRole("textbox")).toHaveValue("0.00");
  });

  test("formats initial value from props", () => {
    render(<IntlNumberInput value={1234.56} />);
    expect(screen.getByRole("textbox")).toHaveValue("1,234.56");
  });

  test("calls onChange with numeric and masked values", () => {
    const onChange = jest.fn();
    render(<IntlNumberInput onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1234" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toBe(12.34);
    expect(onChange.mock.calls[0][2]).toBe("12.34");
  });

  test("handles negative values", () => {
    render(<IntlNumberInput value={-100} precision={0} />);
    expect(screen.getByRole("textbox")).toHaveValue("-100");
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

    const input = screen.getByRole("textbox");
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

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "10100" } });

    const call = onChange.mock.calls[0];
    expect(call[1]).toBe(100);
  });

  test("handles precision 0", () => {
    render(<IntlNumberInput value={1234} precision={0} />);
    expect(screen.getByRole("textbox")).toHaveValue("1,234");
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
    expect(screen.getByRole("textbox")).toHaveValue("$ 100.00 BRL");
  });

  test("disables input when disabled prop is true", () => {
    render(<IntlNumberInput disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
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
    expect(screen.getByRole("textbox")).toHaveValue("1.234,56");
  });

  test("calls onBlur with formatted value", () => {
    const onBlur = jest.fn();
    render(<IntlNumberInput onBlur={onBlur} />);

    const input = screen.getByRole("textbox");
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

    const input = screen.getByRole("textbox");
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

    const input = screen.getByRole("textbox");
    fireEvent.blur(input, { target: { value: "200" } });

    expect(onBlur.mock.calls[0][1]).toBe(100);
    expect(onBlur.mock.calls[0][2]).toBe("100");
  });

  test("reformats display value on blur", () => {
    render(<IntlNumberInput value={0} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1234" } });
    fireEvent.blur(input);

    expect(input).toHaveValue("12.34");
  });

  test("respects inputMode prop override", () => {
    render(<IntlNumberInput inputMode="numeric" precision={2} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "numeric");
  });

  test("falls back to en-US for invalid locale", () => {
    render(<IntlNumberInput value={1234.56} locale="invalid-locale" />);
    expect(screen.getByRole("textbox")).toHaveValue("1,234.56");
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
    expect(screen.getByRole("textbox")).toHaveValue('alert("x")100.00');
    expect(screen.getByRole("textbox").value).not.toContain("<script>");
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

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "200" } });

    expect(onChange.mock.calls[0][1]).toBe(100);
  });

  test("updates display when controlled value prop changes", () => {
    const { rerender } = render(<IntlNumberInput value={10} precision={0} />);
    expect(screen.getByRole("textbox")).toHaveValue("10");

    rerender(<IntlNumberInput value={25} precision={0} />);
    expect(screen.getByRole("textbox")).toHaveValue("25");
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

    const input = screen.getByRole("textbox");
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
});