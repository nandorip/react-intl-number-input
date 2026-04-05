import React from "react";
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
});
