import { useState } from 'react';
import './JsonViewer.css';

function JsonViewer({ data }) {
    const [collapsed, setCollapsed] = useState({});

    const toggleCollapse = (path) => {
        setCollapsed(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    const renderValue = (value, path = '', level = 0) => {
        if (value === null) {
            return <span className="json-null">null</span>;
        }

        if (value === undefined) {
            return <span className="json-undefined">undefined</span>;
        }

        if (typeof value === 'boolean') {
            return <span className="json-boolean">{value.toString()}</span>;
        }

        if (typeof value === 'number') {
            return <span className="json-number">{value}</span>;
        }

        if (typeof value === 'string') {
            return <span className="json-string">"{value}"</span>;
        }

        if (Array.isArray(value)) {
            const isCollapsed = collapsed[path];
            const isEmpty = value.length === 0;

            return (
                <div className="json-array">
                    <span
                        className="json-bracket clickable"
                        onClick={() => !isEmpty && toggleCollapse(path)}
                    >
                        [
                        {!isEmpty && (
                            <span className="collapse-indicator">
                                {isCollapsed ? '...' : ''}
                            </span>
                        )}
                    </span>
                    {!isEmpty && !isCollapsed && (
                        <div className="json-content">
                            {value.map((item, index) => (
                                <div key={index} className="json-item">
                                    <span className="json-index">{index}:</span>
                                    {renderValue(item, `${path}.${index}`, level + 1)}
                                    {index < value.length - 1 && <span className="json-comma">,</span>}
                                </div>
                            ))}
                        </div>
                    )}
                    <span className="json-bracket">]</span>
                    {isEmpty && <span className="json-empty">empty</span>}
                </div>
            );
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            const isCollapsed = collapsed[path];
            const isEmpty = keys.length === 0;

            return (
                <div className="json-object">
                    <span
                        className="json-bracket clickable"
                        onClick={() => !isEmpty && toggleCollapse(path)}
                    >
                        {'{'}
                        {!isEmpty && (
                            <span className="collapse-indicator">
                                {isCollapsed ? '...' : ''}
                            </span>
                        )}
                    </span>
                    {!isEmpty && !isCollapsed && (
                        <div className="json-content">
                            {keys.map((key, index) => (
                                <div key={key} className="json-item">
                                    <span className="json-key">"{key}"</span>
                                    <span className="json-colon">: </span>
                                    {renderValue(value[key], `${path}.${key}`, level + 1)}
                                    {index < keys.length - 1 && <span className="json-comma">,</span>}
                                </div>
                            ))}
                        </div>
                    )}
                    <span className="json-bracket">{'}'}</span>
                    {isEmpty && <span className="json-empty">empty</span>}
                </div>
            );
        }

        return <span>{String(value)}</span>;
    };

    return (
        <div className="json-viewer">
            <div className="json-container">
                {renderValue(data)}
            </div>
        </div>
    );
}

export default JsonViewer;
