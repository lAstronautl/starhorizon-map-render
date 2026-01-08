import { DefaultConfig, parseConfig } from 'frontier-map-renderer-backend';
import { useCallback, useState } from 'preact/hooks';
import './app.css';
import ConfigSection from './config-section';
import MainSection from './main-section';

export function App() {
  const [configSource, setConfigSource] = useState(() => DefaultConfig.trim());
  const [config, setConfig] = useState(() => parseConfig(configSource));

  const [configParseError, setConfigParseError] = useState<string | null>(null);

  const handleChangeConfig = useCallback((source: string): void => {
    setConfigSource(source);

    try {
      const config = parseConfig(source);
      setConfig(config);
      setConfigParseError(null);
    } catch (e) {
      console.error('error parsing config:', e);
      setConfigParseError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return <>
    <MainSection config={config}/>
    <ConfigSection
      initialConfig={configSource}
      parseError={configParseError}
      onChangeConfig={handleChangeConfig}
    />
  </>;
}
