import CopySvg from '@/assets/icons/copy.svg';

function CopyIcon(props: {
  size?: number;
  onClick: () => void;
  className: string;
}) {
  const size = props.size || 28;
  const sizes = size + 'px';
  return (
    <img
      className={props.className}
      src={CopySvg}
      style={{
        width: sizes,
        height: sizes,
      }}
      onClick={() => props.onClick()}
    />
  );
}

export default CopyIcon;
