import React, { useState } from 'react';
import LinkButton from '@ivoyant/component-link-button';
import classnames from 'classnames';
import { MessageBus } from '@ivoyant/component-message-bus';

export default function EBBPopover({
    id,
    ebbStatus,
    enrollmentDate,
    disabledEbbStatuses,
    resetEbbCounter,
    datasources,
    ebbToken,
    visibleReset,
    channel,
    failedRetries,
    programType,
}) {
    const [showReset, setShowReset] = useState(visibleReset);
    const hideDeEnroll = ['Inactive', 'Error'];
    const resetCounter = () => {
        const {
            datasource,
            workflow,
            responseMapping,
            successStates,
            errorStates,
            submitEvent = 'SUBMIT',
        } = resetEbbCounter;

        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: workflow,
                workflow,
                eventType: 'INIT',
            },
        });

        MessageBus.subscribe(
            workflow,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleResetCounterResponse(successStates, errorStates)
        );

        MessageBus.send(
            'WF.'.concat(workflow).concat('.').concat(submitEvent),
            {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: submitEvent,
                },
                body: {
                    datasource: datasources[datasource],
                    request: {
                        params: { token: ebbToken },
                    },
                    responseMapping,
                },
            }
        );
    };

    const handleResetCounterResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const isSuccess = successStates.includes(eventData.value);
        const isError = errorStates.includes(eventData.value);

        if (isSuccess || isError) {
            if (isSuccess) {
                setShowReset(false);
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    return (
        <div className="bridgepay-popover flex-column">
            <div>
                {programType === 'acp'
                    ? 'AFFORDABLE CONNECTIVITY PROGRAM'
                    : 'EMERGENCY BROADBAND BENEFIT PROGRAM'}{' '}
            </div>
            {ebbStatus && (
                <div>
                    Current Status :{' '}
                    <span
                        className={`status ${
                            disabledEbbStatuses?.includes(ebbStatus)
                                ? 'Inactive'
                                : ebbStatus
                        }`}
                    >
                        {ebbStatus}
                    </span>
                </div>
            )}
            {id && <div>Enrollment ID : {id}</div>}
            {enrollmentDate && <div>Enrollment Date : {enrollmentDate}</div>}
            {channel && <div>Incoming Channel: {channel}</div>}
            {failedRetries && (
                <div>Number of failed attempts: {failedRetries}</div>
            )}
            <div className="ebb-buttons-container">
                {!disabledEbbStatuses?.includes(ebbStatus) && (
                    <LinkButton
                        className={classnames('submit-button')}
                        type="primary"
                        size="small"
                        href="/dashboards/ebb-enrollment"
                    >
                        <span>View Form</span>
                    </LinkButton>
                )}
                {showReset && (
                    <LinkButton
                        className={classnames('submit-button')}
                        type="primary"
                        size="small"
                        onClick={resetCounter}
                    >
                        <span>Reset</span>
                    </LinkButton>
                )}
                <LinkButton
                    className={classnames('submit-button')}
                    type="default"
                    size="small"
                    href="/dashboards/history-board#enrollments"
                    routeData={{ currentTab: 2 }}
                >
                    <span>View History</span>
                </LinkButton>
                {!hideDeEnroll?.includes(ebbStatus) && (
                    <LinkButton
                        className={classnames('submit-button')}
                        type="danger"
                        size="small"
                        href="/dashboards/ebb-de-enrollment"
                    >
                        <span>De-enroll</span>
                    </LinkButton>
                )}
            </div>
        </div>
    );
}
