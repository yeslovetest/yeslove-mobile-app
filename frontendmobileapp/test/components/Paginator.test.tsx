import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import Paginator from "@/app/Universal-components/Paginator/Paginator";

describe("Paginator", () => {
  it("renders the current page label", () => {
    render(<Paginator currentPage={2} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByText("Page 2 of 5")).toBeOnTheScreen();
  });

  it("advances to the next page", () => {
    const onPageChange = jest.fn();
    render(<Paginator currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.press(screen.getByText("Next"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("goes back to the previous page", () => {
    const onPageChange = jest.fn();
    render(<Paginator currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.press(screen.getByText("Prev"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("does not page before the first page", () => {
    const onPageChange = jest.fn();
    render(<Paginator currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.press(screen.getByText("Prev"));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("does not page past the last page", () => {
    const onPageChange = jest.fn();
    render(<Paginator currentPage={5} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.press(screen.getByText("Next"));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
