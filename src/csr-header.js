import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import {
    Button,
    Badge,
    Tag,
    Tooltip,
    Popover,
    Row,
    Col,
    Modal,
    Typography,
} from 'antd';
import {
    CaretUpOutlined,
    CaretDownOutlined,
    MailOutlined,
    CompassOutlined,
    CheckCircleFilled,
    CloseCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import './styles.css';
import LinkButton from '@ivoyant/component-link-button';
import { cache } from '@ivoyant/component-cache';
import { Link } from 'react-router-dom';
import plugin from 'js-plugin';
import moment from 'moment';
import { FeatureFlaggingTooltip } from '@ivoyant/component-feature-flagging';
import { MessageBus } from '@ivoyant/component-message-bus';

import StatCard from './StatCard';

import BridgePayIcon from './assets/BridgePay.png';
import AutoPayIcon from './assets/AutoPay.png';
import AmazonIcon from './assets/Amazon.png';
import IconEBB from './assets/iconEBB.svg';
import IconACP from './assets/iconACP.svg';
import IconEBBError from './assets/EBB-Orange.svg';
import IconACPError from './assets/ACP-Orange.svg';
import EBBPopover from './EbbPopOver';
import shortid from 'shortid';

const { Text } = Typography;

const AmountDueTooltip = ({ billCycleDate, billDueDate }) => {
    let dueDate, dueDateDay, dueDateMonth, dueDateYear, monthString;
    if (billDueDate != false) {
        dueDateDay = parseInt(billDueDate.substr(8, 2));
        dueDateMonth = parseInt(billDueDate.substr(5, 2));
        dueDateYear = billDueDate.substr(0, 4);
        // Javascript month is zero-based, we need to subtract by 1
        dueDate = new Date(dueDateYear, dueDateMonth - 1, dueDateDay);
        monthString = dueDate.toLocaleString('default', { month: 'long' });
    } else {
        dueDateDay = parseInt(billCycleDate.substr(8, 2));
        dueDateMonth = parseInt(billCycleDate.substr(5, 2));
        dueDateYear = billCycleDate.substr(0, 4);
        // Javascript month is zero-based, we need to subtract by 1
        dueDate = new Date(dueDateYear, dueDateMonth - 1, dueDateDay);
        dueDate.setDate(dueDate.getDate() - 1);
        monthString = dueDate.toLocaleString('default', { month: 'long' });
    }

    return (
        <div className="amount-due-tooltip flex-column font-14">
            <div className="title">
                Due Date:{' '}
                <span className="amount-due-tooltip-amount">
                    {`${dueDateDay} ${monthString} ${dueDateYear}`}
                </span>
            </div>
        </div>
    );
};

const BridgePayPopover = ({ bridgepayInfo, paymentLink }) => {
    let { status } = bridgepayInfo;
    const { eligibleFor, startDate, endDate, amountToEnroll } = bridgepayInfo;
    /** To hide or disply the make payment button */
    const hideMakePayment = eligibleFor === 'None';

    return (
        <div className="bridgepay-popover flex-column">
            <div>
                Status :
                <span
                    className={classnames(
                        'status',
                        status === 'Inactive' ? 'inactive' : 'active'
                    )}
                >
                    {' '}
                    {status}
                </span>
            </div>
            <div>Eligible for {eligibleFor}</div>
            {startDate && endDate && (
                <div>
                    Start : {startDate} &nbsp;End : {endDate}
                </div>
            )}
            {amountToEnroll && !hideMakePayment && (
                <div>Amount to Enroll : ${amountToEnroll}</div>
            )}
            {!hideMakePayment && (
                <LinkButton
                    className={classnames(
                        'submit-button',
                        status === 'Inactive' ? 'inactive' : 'active'
                    )}
                    size="small"
                    href={paymentLink}
                    routeData={{ bridgepayInfo }}
                >
                    <span>
                        {eligibleFor === 'Bridge Pay'
                            ? 'SETUP BRIDGEPAY'
                            : 'EXTEND BRIDGEPAY'}
                    </span>
                </LinkButton>
            )}
        </div>
    );
};

const handleDeleteAutopayResponse =
    (successStates, errorStates, setProcessing, setDisabled) =>
    (subscriptionId, topic, eventData, closure) => {
        const isSuccess = successStates.includes(eventData.value);
        const isError = errorStates.includes(eventData.value);

        if (isSuccess || isError) {
            if (isSuccess) {
                setDisabled(true);
            }
            setProcessing(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

const CancelAutoPay = ({ datasources, deleteAutopay, ban }) => {
    const {
        datasource,
        workflow,
        responseMapping,
        successStates,
        errorStates,
        submitEvent = 'SUBMIT',
    } = deleteAutopay;
    const [processing, setProcessing] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const initiateDeleteAutopay = () => {
        MessageBus.subscribe(
            workflow,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleDeleteAutopayResponse(
                successStates,
                errorStates,
                setProcessing,
                setDisabled
            ),
            {}
        );

        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: workflow,
                workflow,
                eventType: 'INIT',
            },
        });

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
                    responseMapping,
                    request: {
                        params: { billingAccountNumber: ban },
                    },
                },
            }
        );

        setProcessing(true);
    };

    return (
        <Button
            size="small"
            className="submit-button"
            danger
            loading={processing}
            disabled={disabled}
            onClick={initiateDeleteAutopay}
        >
            Cancel Autopay
        </Button>
    );
};

const AutoPayPopover = ({
    autoPayStatus,
    autoPayLink,
    autoPayEnabled,
    paymentType,
    autoPayInfo,
    deleteAutopay,
    datasources,
    ban,
}) => {
    return (
        <div className="bridgepay-popover flex-column">
            <div>
                Status :{' '}
                <span
                    className={classnames(
                        'status',
                        autoPayStatus === 'A' ? 'active' : 'inactive'
                    )}
                >
                    {autoPayStatus === 'A' ? 'Active' : 'Inactive'}
                </span>
            </div>
            {autoPayStatus === 'A' && autoPayInfo?.paymentCard && (
                <>
                    {autoPayInfo.paymentCard?.paymentMethod &&
                        autoPayInfo.paymentCard?.cardNumber && (
                            <div>
                                {autoPayInfo.paymentCard?.paymentMethod} :{' '}
                                {autoPayInfo.paymentCard?.cardNumber}
                            </div>
                        )}
                    {autoPayInfo?.paymentCard?.expirationMonth && (
                        <div>
                            Expiration :{' '}
                            {autoPayInfo?.paymentCard?.expirationMonth
                                ?.toString()
                                ?.padStart(2, '0')}
                            /{autoPayInfo?.paymentCard?.expirationYear}
                        </div>
                    )}
                </>
            )}
            {autoPayEnabled && (
                <Row justify="start" gutter={[16, 16]}>
                    <Col>
                        <LinkButton
                            className="submit-button"
                            size="small"
                            href={autoPayLink}
                            routeData={{ autoPayStatus }}
                        >
                            <span>
                                {autoPayStatus !== 'A'
                                    ? 'ENROLL IN AUTOPAY'
                                    : 'UPDATE ENROLLMENT'}
                            </span>
                        </LinkButton>
                    </Col>

                    {autoPayStatus === 'A' && (
                        <Col>
                            <CancelAutoPay
                                datasources={datasources}
                                deleteAutopay={deleteAutopay}
                                ban={ban}
                            />
                        </Col>
                    )}
                </Row>
            )}
        </div>
    );
};

const DueImmediatelyPopover = ({
    autoPayStatus,
    banStatus,
    accountBalance = 0,
    dueImmediately = 0,
    onetimePaymentLink,
}) => {
    return accountBalance > 0 ||
        (autoPayStatus !== 'A' && dueImmediately > 0) ? (
        <div className="bridgepay-popover flex-column">
            <div>
                {'Due Immediately  : $ '}
                {banStatus === 'O' ? accountBalance : dueImmediately}
            </div>

            <LinkButton
                className="submit-button"
                size="small"
                href={onetimePaymentLink}
                routeData={{
                    dueImmediately:
                        banStatus === 'O' ? accountBalance : dueImmediately,
                }}
            >
                <span>ONE TIME PAYMENT</span>
            </LinkButton>
        </div>
    ) : (
        <></>
    );
};

const RecentCallerPopover = ({
    recentInteractionCount,
    lastInteractionTime,
}) => (
    <div className="flex-column">
        <Text style={{ color: 'white' }}>
            {recentInteractionCount} call{recentInteractionCount > 1 && `s`} in
            the last 7 days
        </Text>
        <Text style={{ color: 'white' }}>
            Last call:{' '}
            {moment(new Date(lastInteractionTime)).format('Do MMM YYYY')}
        </Text>
    </div>
);

/**
 * Find the value by feature name
 * @param {Array} values
 * @param {String} property
 * @returns {object} value with feature and enable
 */
function getValueByFeature(values, property) {
    const foundValue =
        values && values.find(({ feature }) => feature === property);
    return foundValue;
}

export default function ComponentCsrHeaderComponent(props) {
    const { data, component, datasources, properties, error } = props;
    const [viewStatusChange, setViewStatusChange] = useState(true);

    const {
        accountTypes,
        accountSubTypes,
        accountStatuses,
        noOfDaysToShowBanStatusNew = 30,
        paymentLink,
        autoPayLink,
        onetimePaymentLink,
        quickLinks,
        featureFlagDisableKeys,
        workflows,
        disabledEbbStatuses,
        updateDatasources,
        ebbInactiveStatuses,
    } = properties;

    const { deleteAutopay, resetEbbCounter } = workflows;

    const {
        accountBalances,
        ebbDetails,
        bridgepayInfo,
        paymentsAutopay,
        accountDetails,
        customerInfo,
        lineDetails,
        lineDetailsData,
        autoPayInfo,
        orderCount,
        promoDetails,
        deviceInfo,
        userMessages,
        interactionSummary,
    } = data.data;
    // console.log('data is ', data.data);
    // let activeLines = 0;
    // lineDetails?.subscribers?.forEach((sub) => {
    //     if (sub?.subscriberDetails?.status === 'A') activeLines++;
    // });
    console.log('active',activeLines);
    const {
        autoPayType = 'Credit Card',
        autoPayStatus,
        billDueDate,
        billCycleDate,
        customerSince,
        statusDate,
        statusActvCode,
        statusActvRsnCode,
        openCases,
    } = accountDetails;

    const ViewStatusDatePopover = () => {
        let banStatusMessage;
        let statusChangeDate;

        if (banStatus === 'S') {
            banStatusMessage = 'Suspended';
            statusChangeDate = statusDate;
        } else if (banStatus === 'N' || banStatus === 'C') {
            banStatusMessage = 'Cancelled';
            statusChangeDate = statusDate;
        } else if (banStatus === 'O') {
            banStatusMessage = 'Activated';
            statusChangeDate = customerSince;
        } else {
            setViewStatusChange(false);
        }

        return (
            <div className="amount-due-tooltip flex-column font-14">
                <div className="title">
                    {banStatusMessage} on:{' '}
                    <span className="amount-due-tooltip-amount">
                        {statusChangeDate}
                    </span>
                </div>
            </div>
        );
    };

    let { ban, dueDaysLeft, banStatus } = accountDetails;
    // Hotline suspended
    if (statusActvCode === 'SUS' && statusActvRsnCode === 'CO') {
        dueDaysLeft = 0;
    }

    //Newly created account to have tentative color
    const newAccountInfo = cache.get('newAccountInfo');
    if (
        newAccountInfo &&
        newAccountInfo.ban === window[window.sessionStorage?.tabId].NEW_BAN
    ) {
        banStatus = 'T';
        ban = window[window.sessionStorage?.tabId].NEW_BAN;
    }

    const { name, emailAddress, fullAddress, accountType, accountSubType } =
        customerInfo;

    const { dueAmount, dueImmediately, accountBalance } = accountBalances;

    const bridgePayFeatureFlag = plugin.invoke(
        'features.evaluate',
        'bridgePay'
    );

    const autoPayFeatureFlag = plugin.invoke(
        'features.evaluate',
        'autoPay',
        featureFlagDisableKeys
    );

    const { activeLines } = lineDetails;
    const cohorts =
        ebbDetails?.cohorts?.length > 0 &&
        ebbDetails?.cohorts.map((e) => e.toUpperCase());

    const [expanded, setExpanded] = useState(false);
    const [programType, setProgramType] = useState('');

    useEffect(() => {
        if (cohorts.length > 0 && cohorts.includes('ACP')) {
            setProgramType('acp');
        } else if (cohorts.length > 0 && cohorts.includes('EBB')) {
            setProgramType('ebb');
        } else {
            setProgramType('');
        }
    }, [cohorts]);

    // For tags
    const banStatusColors = {
        O: '#52C41A',
        T: '#1301ff',
        S: '#FA8C16',
        N: '#F5222D',
        C: '#F5222D',
    };

    // Bridge pay and auto pay from feature flagging data
    const bridgePayEnabled =
        bridgePayFeatureFlag[0] && bridgePayFeatureFlag[0].enabled;

    const [autoPayEnabled, setAutoPayEnabled] = useState(
        autoPayFeatureFlag[0] && autoPayFeatureFlag[0].enabled
    );
    //let autoPayEnabled = autoPayFeatureFlag[0] && autoPayFeatureFlag[0].enabled;

    const ebbData = ebbDetails?.associations?.find(
        ({ type }) => type === 'BroadbandBenefit'
    );

    const ebbStatus = ebbData?.status?.length ? ebbData?.status[0]?.value : '';

    const ebbToken = ebbData?.inviteToken;
    /** Customer since calculated in number of days */
    const oneDay = 24 * 60 * 60 * 1000;
    const customerSinceInDays = Math.round(
        Math.abs((new Date(customerSince) - new Date()) / oneDay)
    );

    const disableNewTagCondition =
        customerSinceInDays > noOfDaysToShowBanStatusNew ||
        ['N'].includes(banStatus);

    const errorFound = error?.name;

    const StatusItem = ({ value, label, statusBadge, className }) => {
        return value || value === 0 ? (
            <div className={`stats-item ${className}`}>
                {statusBadge ? (
                    <div className="flex-row justify-content-center">
                        <div className="stats-badge">$</div>
                        <div className="stats-value">{value.toString()}</div>
                    </div>
                ) : (
                    <div className="stats-value">{value.toString()}</div>
                )}
                <div className="stats-label">{label.toString()}</div>
            </div>
        ) : (
            <Tooltip title="data not available at the moment">
                <div className="stats-item">
                    {errorFound && (
                        <div className="stats-value error">
                            <CloseCircleOutlined />
                        </div>
                    )}
                    <div className="stats-label">{label.toString()}</div>
                </div>
            </Tooltip>
        );
    };

    const [visible, setVisible] = useState(false);

    const handleOk = () => {
        window[sessionStorage.tabId]?.dispatchRedux('DATA_REQUEST', {
            loadLatest: true,
            datasources: updateDatasources,
        });
        setVisible(false);
    };

    const statusIcon = (programType, ebbInactiveStatuses) => {
        const status = ebbInactiveStatuses?.includes(ebbStatus.toLowerCase());
        if (status && programType === 'acp') {
            return IconACPError;
        } else if (status && programType === 'ebb') {
            return IconEBBError;
        } else {
            if (programType === 'acp') {
                return IconACP;
            } else {
                return IconEBB;
            }
        }
    };

    useEffect(() => {
        if (banStatus === 'S') {
            setAutoPayEnabled(true);
        }
    }, [banStatus]);

    return (
        <div className="dashboard-header-wrapper">
            <div className="dashboard-header-stats-bar">
                <div
                    className={`ban-status-sider ban-status-bg-color-${banStatus}`}
                />
                {viewStatusChange ? (
                    <Popover
                        overlayClassName="custom-popover"
                        placement="bottomLeft"
                        content={<ViewStatusDatePopover />}
                        color="black"
                        trigger="hover"
                    >
                        <div className="flex-column">
                            <div className="font-weight-bold font-16">
                                {name}
                            </div>
                            <div className="font-14 flex-row">
                                <span
                                    className={`ban-status-color-${banStatus}`}
                                >
                                    BAN : {ban}
                                </span>
                                {disableNewTagCondition ? null : (
                                    <Tag
                                        className="customer-ban-values"
                                        color={
                                            banStatus &&
                                            banStatusColors[banStatus]
                                        }
                                    >
                                        New
                                    </Tag>
                                )}
                            </div>
                        </div>
                    </Popover>
                ) : (
                    <div className="flex-column">
                        <div className="font-weight-bold font-16">{name}</div>
                        <div className="font-14 flex-row">
                            <span className={`ban-status-color-${banStatus}`}>
                                BAN : {ban}
                            </span>
                            {disableNewTagCondition ? null : (
                                <Tag
                                    className="customer-ban-values"
                                    color={
                                        banStatus && banStatusColors[banStatus]
                                    }
                                >
                                    New
                                </Tag>
                            )}
                        </div>
                    </div>
                )}
                <div className="flex-column">
                    <Tooltip placement="topRight" title="Reload account">
                        <SyncOutlined
                            className="refresh-icon"
                            onClick={() => setVisible(true)}
                        />
                    </Tooltip>
                    <Modal
                        title="Reload account"
                        okText="Yes"
                        cancelText="No"
                        open={visible}
                        onOk={handleOk}
                        onCancel={() => setVisible(false)}
                    >
                        <p>
                            Reloading the account will cause you to lose
                            progress. Would you like to proceed?
                        </p>
                    </Modal>
                    <div
                        onClick={() => setExpanded(!expanded)}
                        style={{ marginTop: 12 }}
                    >
                        {expanded ? <CaretUpOutlined /> : <CaretDownOutlined />}
                    </div>
                </div>
                {/* Recent Caller Tag */}
                {interactionSummary?.interactionSummary?.recentCaller && (
                    <div className="flex-column">
                        <Popover
                            placement="right"
                            overlayClassName="custom-popover"
                            content={
                                <RecentCallerPopover
                                    recentInteractionCount={
                                        interactionSummary?.interactionSummary
                                            ?.recentInteractionCount
                                    }
                                    lastInteractionTime={
                                        interactionSummary?.interactionSummary
                                            ?.lastInteractionTime
                                    }
                                />
                            }
                            color="black"
                            trigger="hover"
                        >
                            <Tag color="red" className="recent-contact-tag">
                                RECENT CONTACT
                            </Tag>
                        </Popover>
                    </div>
                )}
                <div className="stats-box">
                    <Popover
                        placement="bottom"
                        overlayClassName="custom-popover"
                        content={
                            <AmountDueTooltip
                                billCycleDate={billCycleDate}
                                billDueDate={billDueDate}
                            />
                        }
                        color="black"
                        trigger="hover"
                    >
                        <div>
                            <StatusItem
                                value={
                                    dueAmount > 0
                                        ? Number(dueAmount).toFixed(2)
                                        : dueAmount
                                }
                                statusBadge
                                label="Amount Due"
                            />
                        </div>
                    </Popover>
                    {dueImmediately || dueImmediately === 0 ? (
                        <div className="stats-item">
                            {accountBalance > 0 ||
                            (autoPayStatus !== 'A' && dueImmediately > 0) ? (
                                <Popover
                                    placement="bottomLeft"
                                    content={
                                        <DueImmediatelyPopover
                                            autoPayStatus={autoPayStatus}
                                            banStatus={banStatus}
                                            accountBalance={accountBalance}
                                            dueImmediately={dueImmediately}
                                            onetimePaymentLink={
                                                onetimePaymentLink
                                            }
                                        />
                                    }
                                    trigger="hover"
                                >
                                    <div className="flex-row justify-content-center">
                                        <div className="stats-badge">$</div>
                                        <div
                                            className={`stats-value ${
                                                dueDaysLeft <= 5 &&
                                                dueImmediately > 0 &&
                                                `ban-status-color-${banStatus}`
                                            }`}
                                        >
                                            {dueImmediately > 0 ||
                                            accountBalance > 0
                                                ? Number(
                                                      banStatus === 'O'
                                                          ? accountBalance
                                                          : dueImmediately
                                                  ).toFixed(2)
                                                : 0}
                                        </div>
                                    </div>
                                    <div className="stats-label">
                                        Due Immediately
                                    </div>
                                </Popover>
                            ) : (
                                <>
                                    {' '}
                                    <div className="flex-row justify-content-center">
                                        <div className="stats-badge">$</div>
                                        <div
                                            className={`stats-value ${
                                                dueDaysLeft <= 5 &&
                                                dueImmediately > 0 &&
                                                `ban-status-color-${banStatus}`
                                            }`}
                                        >
                                            {dueImmediately > 0 ||
                                            accountBalance > 0
                                                ? Number(
                                                      banStatus === 'O'
                                                          ? accountBalance
                                                          : dueImmediately
                                                  ).toFixed(2)
                                                : 0}
                                        </div>
                                    </div>
                                    <div className="stats-label">
                                        Due Immediately
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <StatusItem
                            value={dueImmediately}
                            statusBadge
                            label="Due Immediately"
                        />
                    )}
                    <StatusItem value={dueDaysLeft} label="Due Days Left" />
                    <StatusItem value={activeLines} label="Active Lines" />
                    <div className="stats-item">
                        <FeatureFlaggingTooltip
                            feature="AutoPay"
                            title={
                                !autoPayInfo?.billingAccountNumber &&
                                'data not available at the moment'
                            }
                            disabled={!autoPayInfo?.billingAccountNumber}
                            featureFlag={
                                banStatus === 'S'
                                    ? { enabled: true }
                                    : autoPayFeatureFlag[0]
                            }
                        >
                            {autoPayEnabled &&
                            autoPayInfo?.billingAccountNumber ? (
                                <Popover
                                    placement="bottomLeft"
                                    content={
                                        <AutoPayPopover
                                            autoPayStatus={autoPayStatus}
                                            autoPayLink={autoPayLink}
                                            autoPayEnabled={autoPayEnabled}
                                            paymentType={autoPayType}
                                            autoPayInfo={autoPayInfo}
                                            deleteAutopay={deleteAutopay}
                                            datasources={datasources}
                                            ban={ban}
                                        />
                                    }
                                    trigger="hover"
                                >
                                    <div>
                                        <div
                                            className={classnames(
                                                'stats-value',
                                                !autoPayEnabled && 'inactive'
                                            )}
                                        >
                                            <img
                                                src={AutoPayIcon}
                                                alt="AutoPay"
                                            />
                                        </div>
                                        <div className="stats-label">
                                            AutoPay
                                        </div>
                                    </div>
                                </Popover>
                            ) : (
                                <div>
                                    <div
                                        className={classnames(
                                            'stats-value',
                                            !autoPayEnabled && 'inactive'
                                        )}
                                    >
                                        <img src={AutoPayIcon} alt="AutoPay" />
                                    </div>
                                    <div className="stats-label">AutoPay</div>
                                </div>
                            )}
                        </FeatureFlaggingTooltip>
                    </div>
                    <div className="stats-item">
                        <FeatureFlaggingTooltip
                            feature="Bridgepay"
                            title={
                                !bridgepayInfo?.status &&
                                'data not available at the moment'
                            }
                            featureFlag={bridgePayFeatureFlag[0]}
                            disabled={!bridgepayInfo?.status}
                        >
                            {bridgePayEnabled && bridgepayInfo?.status ? (
                                <Popover
                                    placement="bottomLeft"
                                    content={
                                        <BridgePayPopover
                                            bridgepayInfo={bridgepayInfo}
                                            paymentLink={paymentLink}
                                        />
                                    }
                                    trigger="hover"
                                >
                                    {/** TODO - find a solution not to repeat the code and make tooltip work */}
                                    <div>
                                        <div
                                            className={classnames(
                                                'stats-value',
                                                !bridgePayEnabled && 'inactive'
                                            )}
                                        >
                                            <Badge
                                                count={<CheckCircleFilled />}
                                            >
                                                <img
                                                    src={BridgePayIcon}
                                                    alt="BridgePay"
                                                />
                                            </Badge>
                                        </div>

                                        <div className="stats-label">
                                            BridgePay
                                        </div>
                                    </div>
                                </Popover>
                            ) : (
                                <div>
                                    <div
                                        className={classnames(
                                            'stats-value',
                                            (!bridgePayEnabled ||
                                                !bridgepayInfo?.status) &&
                                                'inactive'
                                        )}
                                    >
                                        <Badge count={<CheckCircleFilled />}>
                                            <img
                                                src={BridgePayIcon}
                                                alt="BridgePay"
                                            />
                                        </Badge>
                                    </div>

                                    <div className="stats-label">BridgePay</div>
                                </div>
                            )}
                        </FeatureFlaggingTooltip>
                    </div>
                    {cohorts?.length > 0 && ebbStatus && (
                        <div className="stats-item">
                            <Popover
                                placement="bottomLeft"
                                content={
                                    <EBBPopover
                                        programType={programType}
                                        ebbStatus={ebbStatus}
                                        disabledEbbStatuses={
                                            disabledEbbStatuses
                                        }
                                        datasources={datasources}
                                        {...ebbData}
                                        resetEbbCounter={resetEbbCounter}
                                        ebbToken={ebbToken}
                                        channel={ebbData?.channel}
                                        failedRetries={ebbData?.failedRetries}
                                        visibleReset={
                                            ebbData?.failedRetries >= 4
                                        }
                                    />
                                }
                                trigger="hover"
                            >
                                <div>
                                    <div className="stats-value'">
                                        {/* <img
                                            src={
                                                ebbInactiveStatuses.includes(
                                                    ebbStatus.toLowerCase()
                                                )
                                                    ? FccSymbolError
                                                    : FccSymbol
                                            }
                                            style={{
                                                width: 32,
                                                height: 32,
                                                marginTop: 12,
                                            }}
                                            alt="EBB"
                                        /> */}
                                        <img
                                            src={statusIcon(
                                                programType,
                                                ebbInactiveStatuses
                                            )}
                                            // src={
                                            //     programType === 'acp'
                                            //         ? IconACP
                                            //         : IconEBB
                                            // }
                                            style={{
                                                width: 48,
                                                height: 32,
                                                marginTop: 6,
                                                marginBottom: 6,
                                            }}
                                            alt={programType}
                                        />
                                    </div>

                                    <div className="stats-label">
                                        {programType.toUpperCase()} Program
                                    </div>
                                </div>
                            </Popover>
                        </div>
                    )}

                    <div className="stats-item">
                        <div className="stats-value">
                            {orderCount?.reasons?.includes('Pending Order')
                                ? 1
                                : 0}
                        </div>
                        <div className="stats-label">Pending Orders</div>
                    </div>
                    <StatusItem value={openCases} label="Open Cases" />
                    {accountSubType === 'Z' && (
                        <div className="stats-item">
                            <div className="stats-value">
                                <img src={AmazonIcon} alt="Amazon" />
                            </div>
                            <div className="stats-label">Amazon</div>
                        </div>
                    )}
                </div>
            </div>
            {expanded && (
                <div className="dashboard-header-cards-wrapper">
                    <StatCard
                        title="Contact Details"
                        items={[
                            {
                                label: <MailOutlined className="text-gray" />,
                                value: emailAddress,
                            },
                            {
                                label: (
                                    <CompassOutlined className="text-gray" />
                                ),
                                value: fullAddress,
                            },
                        ]}
                    />
                    <StatCard
                        title={
                            <div className="flex-row">
                                <span>Account No :&nbsp;</span>
                                <span className="text-green">{ban}</span>
                            </div>
                        }
                        className="account"
                        items={[
                            {
                                label: 'AR Balance',
                                value: `$ ${
                                    accountBalance !== undefined &&
                                    accountBalance !== '' &&
                                    accountBalance !== null
                                        ? Number(accountBalance).toFixed(2)
                                        : 'N/A'
                                }`,
                            },
                            {
                                label: 'Type',
                                value: `${
                                    accountType ? accountTypes[accountType] : ''
                                } / ${
                                    accountSubType
                                        ? accountSubTypes[accountSubType]
                                        : ''
                                }`,
                            },
                            {
                                label: 'Status',
                                value: banStatus
                                    ? accountStatuses[banStatus]
                                    : '',
                            },
                            {
                                label: promoDetails?.promoDescription
                                    ? 'Promo Description'
                                    : '',
                                value: promoDetails?.promoDescription,
                            },
                        ]}
                        isColon
                    />
                    <StatCard
                        title="Payments"
                        items={[
                            {
                                label: 'Next Bill Cycle Date',
                                value: billCycleDate,
                            },
                            {
                                label: 'Next Payment Amount',
                                value: `$  ${
                                    dueAmount
                                        ? Number(dueAmount).toFixed(2)
                                        : 'N/A'
                                }`,
                            },
                            {
                                label: 'Last Payment Channel',
                                value: 'N/A',
                            },
                        ]}
                        isColon
                    />
                    <div className="actions-list flex-row align-items-center">
                        <ul>
                            {quickLinks.map((ql) => (
                                <li key={shortid.generate()}>
                                    <Link
                                        to={ql.link}
                                        onClick={() => setExpanded(!expanded)}
                                    >
                                        <a>{ql.label}</a>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
