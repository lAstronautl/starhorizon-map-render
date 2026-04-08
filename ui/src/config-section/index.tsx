import { useState } from 'preact/hooks';
import { CheckIcon, CloseIcon, ConfigIcon, ErrorIcon } from '../icons';
import YamlEditor from '../yaml-editor';
import './index.css';

export interface ConfigSectionProps {
  initialConfig: string;
  parseError: string | null;
  onChangeConfig: (source: string) => void;
}

export default function ConfigSection({
  initialConfig,
  parseError,
  onChangeConfig,
}: ConfigSectionProps) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  const toggleOpen = () => {
    setAnimating(true);
    setOpen(x => !x);
  };

  return (
    <div class='ConfigSectionWrapper'>
      <section
        inert={!open && !animating}
        class={
          `ConfigSection ${
            open ? 'ConfigSection-open' : ''
          } ${
            animating ? 'ConfigSection-animating' : ''
          }`
        }
        onTransitionEnd={e => {
          if (e.target === e.currentTarget) {
            setAnimating(false);
          }
        }}
      >
        <div class='ConfigSectionContent'>
          <div class='ConfigSectionHeader'>
            {parseError == null && <>
              <CheckIcon class='Success'/>
              <span class='ConfigStatus Success'>
                Работает
              </span>
            </>}
            {parseError != null && <>
              <ErrorIcon class='Error'/>
              <span class='ConfigStatus Error'>
                Иди чини: {parseError}
              </span>
            </>}
            <span class='Spacer'/>
            <button onClick={toggleOpen}>
              <span>Закрыть</span>
              <CloseIcon/>
            </button>
          </div>
          <YamlEditor
            initialValue={initialConfig}
            onChangeDebounced={onChangeConfig}
          />
        </div>
      </section>
      <button class='ConfigToggle' onClick={toggleOpen}>
        <ConfigIcon />
        <span>Конфигурация</span>
      </button>
    </div>
  );
}
