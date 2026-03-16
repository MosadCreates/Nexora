import React from 'react';
import { cn } from '../../lib/utils';

interface ComponentPreviewProps {
  name: string;
  styleName?: string;
  className?: string;
  hideCode?: boolean;
  children?: React.ReactNode;
  direction?: 'ltr' | 'rtl';
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  name,
  className,
  children,
  direction = 'ltr'
}) => {
  // Simple mapping for typography demos since we don't have the actual registry
  const renderDemo = () => {
    switch (name) {
      case 'typography-h1':
        return <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-black dark:text-white">The Joke Tax Chronicles</h1>;
      case 'typography-h2':
        return <h2 className="scroll-m-20 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-black dark:text-white">The King's Plan</h2>;
      case 'typography-h3':
        return <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-black dark:text-white">The Joke Tax</h3>;
      case 'typography-h4':
        return <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-black dark:text-white">People are unhappy</h4>;
      case 'typography-p':
        return <p className="leading-7 [&:not(:first-child)]:mt-6 text-neutral-600 dark:text-neutral-400">The king thought that if he taxed jokes, he would be rich. He was right.</p>;
      case 'typography-blockquote':
        return <blockquote className="mt-6 border-l-2 border-neutral-300 dark:border-neutral-700 pl-6 italic text-neutral-700 dark:text-neutral-300">"After all," he said, "everyone loves a good laugh."</blockquote>;
      case 'typography-table':
        return (
          <div className="my-6 w-full overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="m-0 border-t border-neutral-200 dark:border-neutral-800 p-0 even:bg-neutral-50 dark:even:bg-neutral-900">
                  <th className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">King's Treasury</th>
                  <th className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="m-0 border-t border-neutral-200 dark:border-neutral-800 p-0 even:bg-neutral-50 dark:even:bg-neutral-900">
                  <td className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">Empty</td>
                  <td className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">$0</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 'typography-list':
        return (
          <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-neutral-600 dark:text-neutral-400">
            <li>1st level of jokes: 5 gold coins</li>
            <li>2nd level of jokes: 10 gold coins</li>
            <li>3rd level of jokes: 20 gold coins</li>
          </ul>
        );
      case 'typography-inline-code':
        return <code className="relative rounded bg-neutral-100 dark:bg-white/10 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">@radix-ui/react-typography</code>;
      case 'typography-lead':
        return <p className="text-xl text-neutral-500 dark:text-neutral-400">A modal dialog that interrupts the user with important content and expects a response.</p>;
      case 'typography-large':
        return <div className="text-lg font-semibold text-black dark:text-white">Are you absolutely sure?</div>;
      case 'typography-small':
        return <small className="text-sm font-medium leading-none text-neutral-500 dark:text-neutral-400">Email address</small>;
      case 'typography-muted':
        return <p className="text-sm text-neutral-500 dark:text-neutral-400">Enter your email address.</p>;
      default:
        return children || <div className="text-sm text-neutral-500 italic">Example preview for {name}</div>;
    }
  };

  return (
    <div className={cn("group relative my-4 flex flex-col space-y-2", className)} dir={direction}>
      <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-6 preview">
        {renderDemo()}
      </div>
    </div>
  );
};
