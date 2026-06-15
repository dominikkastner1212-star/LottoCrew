export function NumberRow({ numbers, euroNumbers = [] }: { numbers: number[]; euroNumbers?: number[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {numbers.map((number) => (
        <span key={`n-${number}`} className="number-ball">
          {number}
        </span>
      ))}
      {euroNumbers.map((number) => (
        <span key={`e-${number}`} className="number-ball euro-ball">
          {number}
        </span>
      ))}
    </div>
  );
}
