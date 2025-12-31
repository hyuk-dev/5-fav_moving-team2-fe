'use client';

import Grid from '@mui/material/Grid';
import { Stack, Divider } from '@mui/material';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { OutlinedButton } from '../../Button/OutlinedButton';
import { SolidButton } from '../../Button/SolidButton';
import { useMediaQuery } from '@mui/system';
import { colorChips } from '@/shared/styles/colorChips';
import theme from '@/shared/theme';
import ProfileFormHeader from './ProfileFormHeader';
import ProfileFormLeft from './ProfileFormLeft';
import ProfileFormRight from './ProfileFormRight';
import { CustomerProfileForm, MoverBaseInfoForm, MoverProfileForm } from '@/shared/types/types';
import {
  BaseInfoPayload,
  updateCustomerProfile,
  updateMoverBaseInfo,
  updateMoverProfile,
} from '@/shared/core/profile/service';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PATH, REGIONS, SERVICE_TYPES } from '@/shared/constants';
import useUserStore from '@/shared/store/useUserStore';
import customAxios from '@/lib/customAxios';

interface ProfileFormProps {
  mode: 'create' | 'modify' | 'baseInfo';
  userType: 'customer' | 'mover';
}

type FormTypes = (CustomerProfileForm | MoverProfileForm | MoverBaseInfoForm) & {
  newPasswordConfirm?: string;
};

export default function ProfileForm({ mode, userType }: ProfileFormProps) {
  const { userInfo, customerData, moverData } = useUserStore();
  const isModify = mode === 'modify';
  const isBaseInfo = mode === 'baseInfo';
  const isCustomer = userType === 'customer';
  const isCreate = mode === 'create';

  const getServiceKey = (label: string) => SERVICE_TYPES.find((s) => s.label === label)?.key ?? '';
  const getRegionKey = (label: string) => REGIONS.find((r) => r.label === label)?.key ?? '';
  const getRegionLabel = (key: string) => REGIONS.find((r) => r.key === key)?.label ?? '';
  const getServiceLabel = (key: string) => SERVICE_TYPES.find((s) => s.key === key)?.label ?? '';

  const isCustomerDefault = isCustomer && userInfo && customerData;
  const isMoverDefault = !isCustomer && userInfo && moverData;

  const getDefaultValues = (): FormTypes => {
    if (!isCreate) {
      if (isCustomerDefault) {
        return {
          username: userInfo.username ?? '',
          phoneNumber: userInfo.phoneNumber ?? '',
          email: userInfo.email ?? '',
          service: (customerData.wantService ?? []).map(getServiceLabel),
          region: (customerData.livingPlace ?? []).map(getRegionLabel),
          currentPassword: '',
          newPassword: '',
          newPasswordConfirm: '',
        };
      }

      if (isMoverDefault) {
        const sharedValues = {
          username: userInfo.username ?? '',
          phoneNumber: userInfo.phoneNumber ?? '',
          email: userInfo.email ?? '',
          nickname: moverData.nickname ?? '',
          career: moverData.career ?? '',
          intro: moverData.intro ?? '',
          detailDescription: moverData.detailDescription ?? '',
          currentPassword: '',
          newPassword: '',
          newPasswordConfirm: '',
        };
        return {
          ...sharedValues,
          service: (moverData.serviceList ?? []).map(getServiceLabel),
          region: (moverData.serviceArea ?? []).map(getRegionLabel),
          serviceList: (moverData.serviceList ?? []).map(getServiceLabel),
          serviceArea: (moverData.serviceArea ?? []).map(getRegionLabel),
        };
      }
    }

    return {
      username: '',
      phoneNumber: '',
      email: '',
      nickname: '',
      career: '',
      intro: '',
      detailDescription: '',
      service: [],
      region: [],
      serviceList: [],
      serviceArea: [],
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    };
  };

  const methods = useForm<FormTypes>({
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const {
    reset,
    trigger,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
    getValues,
  } = methods;

  useEffect(() => {
    if (!isCreate) {
      reset(getDefaultValues(), { keepDefaultValues: true });
      trigger();
    }
  }, [isCustomer, mode, userInfo, customerData, moverData, reset]);

  const isMd = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const newPassword = useWatch({ control, name: 'newPassword', defaultValue: '' });
  const currentPassword = useWatch({ control, name: 'currentPassword', defaultValue: '' });

  const wantsPwdChange = !!newPassword || !!currentPassword || !!getValues('newPasswordConfirm');
  const passwordsFilled = !!newPassword && !!currentPassword && !!getValues('newPasswordConfirm');
  const moverBasic =
    !isCustomer &&
    isModify &&
    ['username', 'email', 'phoneNumber', 'nickname', 'career', 'intro', 'detailDescription'].every(
      (name) => !!getValues(name as keyof FormTypes),
    );

  const enableSubmit = (() => {
    if (isCreate) {
      return isDirty && isValid;
    }

    if (isCustomer && isModify) {
      if (wantsPwdChange) {
        return isDirty && isValid && passwordsFilled;
      }
      return isDirty && isValid;
    }

    if (!isCustomer && isBaseInfo) {
      if (wantsPwdChange) {
        return isValid && passwordsFilled;
      }
      return isDirty && isValid;
    }

    if (!isCustomer && isModify) {
      return moverBasic && isValid;
    }

    return false;
  })();

  useEffect(() => {
    trigger('newPasswordConfirm');
  }, [newPassword, trigger]);

  useEffect(() => {
    trigger('newPassword');
  }, [currentPassword, trigger]);

  const dividerSpacing = {
    create: {
      customer: { first: { mt: '32px', mb: '64px' }, rest: { mt: '16px', mb: '20px' } },
      mover: { first: { mt: '48px', mb: '48px' }, rest: { mt: '24px', mb: '20px' } },
    },
    modify: {
      customer: { first: { mt: '40px', mb: '40px' }, rest: { mt: '32px', mb: '20px' } },
      mover: { first: { mt: '40px', mb: '40px' }, rest: { mt: '16px', mb: '20px' } },
    },
    baseInfo: {
      customer: { first: { mt: '40px', mb: '40px' }, rest: { mt: '32px', mb: '20px' } },
      mover: { first: { mt: '40px', mb: '40px' }, rest: { mt: '16px', mb: '20px' } },
    },
  } as const;

  const LeftGrid = isModify || !isCustomer;
  const DividerSpacingMediaT = isMd ? dividerSpacing[mode][userType].rest.mt : dividerSpacing[mode][userType].first.mt;
  const DividerSpacingMediaB = isMd ? dividerSpacing[mode][userType].rest.mb : dividerSpacing[mode][userType].first.mb;

  // TODO alert부분 나중에 모달로 수정하면 좋을듯
  const onSubmit = async (data: FormTypes) => {
    const { setUserInfo, setCustomerData, setMoverData } = useUserStore.getState();

    try {
      // mover 기본 수정 일떄
      if (isBaseInfo && !isCustomer) {
        const d = data as MoverBaseInfoForm;
        const payload: BaseInfoPayload = {
          username: d.username,
          email: d.email,
          phoneNumber: d.phoneNumber,
          ...(d.currentPassword && d.newPassword
            ? {
                currPassword: d.currentPassword,
                newPassword: d.newPassword,
              }
            : {}),
        };

        const res = await updateMoverBaseInfo(payload);

        if (!res || res.success !== true) {
          throw new Error(res?.message ?? '기본 정보 저장에 실패했습니다.');
        }

        setUserInfo('mover', {
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          profileImage: res.data.profileImage ?? null,
          isProfile: res.data.isProfile,
        });

        setMoverData({
          nickname: res.data.nickname ?? null,
          serviceList: res.data.serviceList ?? null,
          serviceArea: res.data.serviceArea ?? null,
          intro: res.data.intro ?? null,
          career: res.data.career ?? null,
          detailDescription: res.data.detailDescription ?? null,
          likeCount: res.data.likeCount ?? null,
          totalRating: res.data.totalRating ?? null,
          reviewCounts: res.data.reviewCounts ?? null,
          confirmQuotation: res.data.confirmQuotation ?? null,
        });

        alert('기본정보가가 성공적으로 저장되었습니다.');
        router.back();
        return;
      }

      // Customer + 등록 일때
      if (isCustomer && isCreate) {
        const d = data as CustomerProfileForm;
        const serviceKeys = (d.service ?? []).map(getServiceKey).filter(Boolean);
        const regionKeys = (d.region ?? []).map(getRegionKey).filter(Boolean);

        const formData = new FormData();

        if (d.profileImage && d.profileImage instanceof File) {
          formData.append('profileImage', d.profileImage);
        }
        formData.append('wantService', serviceKeys.join(','));
        formData.append('livingPlace', regionKeys.join(','));

        const res = await updateCustomerProfile(formData);

        const refreshRes = await customAxios.post('/api/auth/refresh');

        const newToken = refreshRes.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        if (!res || res.success !== true) {
          throw new Error(res?.message ?? '프로필 등록에 실패했습니다.');
        }

        setUserInfo('customer', {
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          profileImage: res.data.profileImage ?? null,
          isProfile: res.data.isProfile,
        });

        setCustomerData({
          wantService: res.data.wantService ?? null,
          livingPlace: res.data.livingPlace ?? null,
          hasQuotation: res.data.hasQuotation ?? false,
        });

        const hasQuotation = res.data.hasQuotation;

        if (!hasQuotation) {
          router.push(PATH.customer.movingQuoteRequest);
          return;
        }

        router.push(PATH.customer.movingQuoteHistory);
        return;
      }

      // Customer + 수정 일때
      if (isCustomer && isModify) {
        const d = data as CustomerProfileForm;
        const formData = new FormData();
        const serviceKeys = (d.service ?? []).map(getServiceKey).filter(Boolean);
        const regionKeys = (d.region ?? []).map(getRegionKey).filter(Boolean);

        if (d.username) formData.append('username', d.username);
        if (d.currentPassword && d.newPassword) {
          formData.append('currPassword', d.currentPassword);
          formData.append('newPassword', d.newPassword);
        }
        if (d.profileImage && d.profileImage instanceof File) {
          formData.append('profileImage', d.profileImage);
        }
        formData.append('phoneNumber', d.phoneNumber);
        formData.append('wantService', serviceKeys.join(','));
        formData.append('livingPlace', regionKeys.join(','));

        const res = await updateCustomerProfile(formData);

        if (!res || res.success !== true) {
          throw new Error(res?.message ?? '프로필 수정에 실패했습니다.');
        }

        setUserInfo('customer', {
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          profileImage: res.data.profileImage ?? null,
          isProfile: res.data.isProfile,
        });

        setCustomerData({
          wantService: res.data.wantService ?? null,
          livingPlace: res.data.livingPlace ?? null,
          hasQuotation: res.data.hasQuotation ?? false,
        });

        alert('프로필이 성공적으로 저장되었습니다.');
        router.back();
        return;
      }

      // mover 생성 / 수정 일때
      if (!isCustomer && !isBaseInfo) {
        const d = data as MoverProfileForm;

        const serviceKeys = (d.service ?? []).map(getServiceKey).filter(Boolean);
        const regionKeys = (d.region ?? []).map(getRegionKey).filter(Boolean);

        const formData = new FormData();

        if (d.profileImage && d.profileImage instanceof File) {
          formData.append('profileImage', d.profileImage);
        }
        formData.append('nickname', d.nickname);
        formData.append('career', d.career);
        formData.append('intro', d.intro);
        formData.append('detailDescription', d.detailDescription);
        formData.append('serviceList', serviceKeys.join(','));
        formData.append('serviceArea', regionKeys.join(','));

        const res = await updateMoverProfile(formData);

        const refreshRes = await customAxios.post('/api/auth/refresh');

        const newToken = refreshRes.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        if (!res || res.success !== true) {
          throw new Error(res?.message ?? '프로필 저장에 실패했습니다.');
        }
        setUserInfo('mover', {
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          profileImage: res.data.profileImage ?? null,
          isProfile: res.data.isProfile,
        });

        setMoverData({
          nickname: res.data.nickname ?? null,
          serviceList: res.data.serviceList ?? null,
          serviceArea: res.data.serviceArea ?? null,
          intro: res.data.intro ?? null,
          career: res.data.career ?? null,
          detailDescription: res.data.detailDescription ?? null,
          likeCount: res.data.likeCount ?? null,
          totalRating: res.data.totalRating ?? null,
          reviewCounts: res.data.reviewCounts ?? null,
          confirmQuotation: res.data.confirmQuotation ?? null,
        });

        if (isModify) {
          router.back();
          return;
        }

        router.push(PATH.mover.movingQuoteRequest);
        return;
      }

      throw new Error('알 수 없는 요청입니다.');
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <FormProvider {...methods}>
      <Stack
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        width="100%"
        maxWidth={isCustomer && !isModify ? (isMd ? '327px' : '640px') : undefined}
        mx="auto"
        pt={isMd ? '16px' : '24px'}
        pb="40px"
        mb="38px"
      >
        <ProfileFormHeader mode={mode} userType={userType} />
        <Divider
          sx={{
            borderColor: colorChips.line['f2f2f2'],
            mt: DividerSpacingMediaT,
            mb: DividerSpacingMediaB,
          }}
        />

        <Grid
          container
          spacing={isMd ? 0 : 9}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={isCustomer ? '' : 'flex-start'}
        >
          {LeftGrid && (
            <Grid size={{ xs: 12, md: 6 }}>
              <ProfileFormLeft mode={mode} userType={userType} />
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 6 }} sx={{ width: '100%' }}>
            <Stack spacing={6}>
              <ProfileFormRight mode={mode} userType={userType} />

              {isCreate && !isCustomer && (
                <SolidButton type="submit" text="시작하기" width="100%" disabled={isSubmitting || !enableSubmit} />
              )}
            </Stack>
          </Grid>
        </Grid>

        {!isCreate && (
          <Stack mt={7} width="100%">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="center" alignItems="center">
              {isMd ? (
                <>
                  <SolidButton type="submit" text="수정하기" width="100%" disabled={isSubmitting || !enableSubmit} />
                  <OutlinedButton type="button" text="취소" width="100%" onClick={() => router.back()} />
                </>
              ) : (
                <>
                  <OutlinedButton type="button" text="취소" width="100%" onClick={() => router.back()} />
                  <SolidButton type="submit" text="수정하기" width="100%" disabled={isSubmitting || !enableSubmit} />
                </>
              )}
            </Stack>
          </Stack>
        )}

        {isCreate && isCustomer && (
          <Stack mt={7} width="100%">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="center" alignItems="center">
              <SolidButton type="submit" text="시작하기" width="100%" disabled={isSubmitting || !enableSubmit} />
            </Stack>
          </Stack>
        )}
      </Stack>
    </FormProvider>
  );
}
