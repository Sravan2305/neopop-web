import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Portal } from 'react-portal';
import { HorizontalSpacer, Column } from '../../Helpers';
import { typographyGuide } from '../../../primitives';
import Typography from '../../Typography';
import { Icon, ToastItem } from '../styles';
import { ToastIconProps, ToastProps } from '../types';
import { hexToRGBA } from '../../../utils';
import { getToastColor } from '@primitives/toasts';

const generateId = () => Math.random().toString(36).substring(2, 10);

const DEFAULT_MSG = 'Something went wrong!';

const DEFAULT_TYPE = 'error';

const ToastIcon = ({ icon }: ToastIconProps) => {
    if (!icon) return null;
    return <Icon src={icon} />;
};

export const Toast = (props: ToastProps) => {
    const {
        id,
        type,
        content = DEFAULT_MSG,
        colorConfig = getToastColor(type ?? DEFAULT_TYPE),
        textStyle = { ...typographyGuide.toast },
        fullWidth = true,
        dismissOnClick = false,
        description,
        icon,
        removeToast,
        autoCloseTime,
    } = props;

    return (
        <ToastItem
            background={colorConfig.background}
            autoCloseTime={autoCloseTime}
            fullWidth={fullWidth}
            onClick={() => (dismissOnClick && removeToast && id ? removeToast(id) : null)}
        >
            <Column>
                <Typography {...textStyle.heading} color={colorConfig.color}>
                    {content}
                </Typography>
                {description ? (
                    <>
                        <HorizontalSpacer n={1} />
                        <Typography
                            {...textStyle.description}
                            color={hexToRGBA(colorConfig?.color, 0.5)}
                        >
                            {description}
                        </Typography>
                    </>
                ) : null}
            </Column>
            <ToastIcon icon={icon} />
        </ToastItem>
    );
};

export const ToastPortal = forwardRef((props, ref) => {
    const [toastList, setToastList] = useState<ToastProps[]>([]);
    const [removeId, setRemoveId] = useState<string | undefined>('');

    useImperativeHandle(ref, () => ({
        addToast(options: ToastProps) {
            setToastList([...toastList, { ...options, id: generateId() }]);
        },
    }));

    const removeToast = (id: string | undefined) => {
        if (id) {
            setToastList((toasts) => toasts.filter((toast) => toast.id !== id));
        }
    };

    useEffect(() => {
        if (removeId) {
            removeToast(removeId);
        }
    }, [removeId]);

    useEffect(() => {
        if (toastList.length) {
            const { id, autoCloseTime } = toastList[toastList.length - 1];
            setTimeout(() => {
                setRemoveId(id);
            }, autoCloseTime || 3000);
        }
    }, [toastList]);

    if (!toastList) return null;
    if (toastList && !toastList.length) return null;

    return (
        <Portal>
            <div>
                {toastList.map((toastItemData) => {
                    const { id, ...propsToFwd } = toastItemData;
                    return <Toast key={id} id={id} {...propsToFwd} removeToast={removeToast} />;
                })}
            </div>
        </Portal>
    );
});
