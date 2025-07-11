import General from "../../../Utils/General"

const TopBarCopyright = ({ data }) => {
  const copyright = General.get('copyright') ?? ''
  const content = copyright.replace(/\{\{([^}]+)\}\}/g, (match, code) => {
    try {
      return eval(code);
    } catch (error) {
      console.error('Error evaluating code:', error);
      return match;
    }
  });

  return <div className={`${data?.background || "bg-white"}  text-sm font-medium py-3 customtext-neutral-light text-center px-primary flex justify-center items-center font-title`}>
    <p>{content}</p>
  </div>
}

export default TopBarCopyright