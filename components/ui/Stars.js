import { FaStar, FaRegStar } from 'react-icons/fa';

export default function Stars({ value = 0, size = 14 }) {
  return (
    <span className="inline-flex text-brandyellow-500" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (i <= Math.round(value) ? <FaStar key={i} size={size} /> : <FaRegStar key={i} size={size} />))}
    </span>
  );
}
