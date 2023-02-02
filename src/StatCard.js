import React from 'react';
import { Card } from 'antd';

export default function StatCard({ title, items, isColon, className }) {
    return (
        <Card size="small" className={`stat-card ${className}`}>
            <div className="title">{title}</div>
            <div className="stats-wrapper">
                {items.map((item, index) =>
                    item.label ? (
                        <React.Fragment key={index}>
                            <div className="stat-label">{item.label}</div>
                            <div className="stat-value">
                                {isColon && (
                                    <span style={{ marginRight: 12 }}>:</span>
                                )}
                                {item.value}
                            </div>{' '}
                        </React.Fragment>
                    ) : (
                        <></>
                    )
                )}
            </div>
        </Card>
    );
}
