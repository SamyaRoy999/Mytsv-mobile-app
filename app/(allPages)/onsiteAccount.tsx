import { ImgLogo, OnsiteAccount } from '@/assets/images/images'
import { IconBackLeft, IconClose, IconErowWhite, IconOneTime, IconWhatYouGet, IconWhoIs } from '@/icons/Icon'
import tw from '@/lib/tailwind'
import { useOnsiteAccountRegMutation } from '@/redux/apiSlices/Account/accountSlice'
import { usePriceGetAllQuery } from '@/redux/apiSlices/Home/homeApiSlices'
import { _HIGHT, _Width } from '@/utils/utils'
import { Entypo } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Formik } from 'formik'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification'
import { SvgXml } from 'react-native-svg'
import * as Yup from "yup"

const OnsiteAccountScreen = () => {
    // ............ All state ................//
    const [payRegisterModal, setPayRegisterModal] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ............ Post api for register ................//
    const [onsiteAccountReg] = useOnsiteAccountRegMutation()
    const { data: priceOnSide } = usePriceGetAllQuery({});

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        const data = {
            representative_secret_key: values.representative,
            channel_name: values.channel_name,
            name: values.name,
            email: values.email,
            password: values.password,
            c_password: values.c_password,
            registration_type: "on_site"
        }

        try {
            const res = await onsiteAccountReg(data).unwrap();
            if (res.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: res?.message,
                    autoClose: 2000,
                });

                // Navigate to OTP screen with necessary data
                router.push({
                    pathname: '/auth/onSiteOtp',
                    params: {
                        email: values.email,
                        userId: res.data.id,
                        amount: priceOnSide?.data?.onsite_account_creation || "0"
                    }
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: res?.message?.email?.[0] || "Something went wrong!",
                    autoClose: 2000,
                });
            }
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error',
                textBody: error?.message || "Registration failed",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <View style={tw`bg-primary flex-1`}>
            <ScrollView contentContainerStyle={tw`pb-20`} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={tw`p-4`}>
                    <View style={tw`flex-row justify-between items-center gap-5 px-5 mb-8`}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <View
                                style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
                            >
                                <SvgXml xml={IconBackLeft} />
                            </View>
                        </TouchableOpacity>
                        <Text style={tw`font-poppinsMedium text-xl`}>Onsite account creation</Text>
                        <View />
                    </View>
                </View>

                {/* Top Banner */}
                <View style={tw`relative`}>
                    <Image
                        style={{ width: _Width, height: _HIGHT * 0.3 }}
                        source={OnsiteAccount}
                    />
                    <Text style={tw`absolute bottom-0 text-white font-poppinsMedium text-lg p-4`}>
                        Get Discovered Locally: Sign Up Your Business on MyTSV.com
                    </Text>
                </View>

                {/* Description */}
                <View style={tw`px-5 mt-5`}>
                    <Text style={tw`text-xl font-poppinsMedium text-center text-black mb-2`}>
                        Grow Your Business with Real Video Exposure
                    </Text>
                    <Text style={tw`text-base font-poppins mb-4 text-center`}>
                        Our representatives are visiting local businesses like yours to offer an exclusive opportunity to join *MyTSV.com*— the platform connecting local services with real local customers.
                    </Text>
                </View>

                {/* What You Get */}
                <LinearGradient
                    colors={['#EC008C', '#FC6767']}
                    style={tw`rounded-xl mx-5 mb-10 p-4 relative`}
                >
                    <View style={tw`absolute -top-8 left-[45%]  border-8 rounded-full border-primary`}>
                        <SvgXml xml={IconWhatYouGet} />
                    </View>
                    <View style={tw`py-10 px-6`}>
                        <Text style={tw`text-white font-poppinsMedium text-xl mb-2 text-center `}> What You Get</Text>
                        <Text style={tw`text-white  leading-6 font-poppins text-base`}>
                            • A professionally recorded and uploaded video of your business{'\n'}
                            • Feature listing in your category{'\n'}
                            • Photos, banners, SEO support{'\n'}
                            • Business contact & appointment tools{'\n'}
                            • Boost reach to MyTSV customers — "find local"{'\n'}
                            • Paid ads on local search feed{'\n'}
                            • Full customer support and optimization assistance
                        </Text>
                    </View>
                </LinearGradient>

                {/* Who Is This For */}
                <LinearGradient
                    colors={['#EC008C', '#FC6767']}
                    style={tw`rounded-xl mx-5 mb-10 p-4 relative`}
                >
                    <View style={tw`absolute -top-8 left-[45%]  border-8 rounded-full border-primary`}>
                        <SvgXml xml={IconWhoIs} />
                    </View>
                    <View style={tw`py-10 px-6`}>
                        <Text style={tw`text-white font-poppinsMedium text-xl mb-2 text-center `}>  Who is This For?</Text>
                        <Text style={tw`text-white  leading-6 font-poppins text-base`}>
                            • Local service providers (doctors, salons, etc.){'\n'}
                            • New businesses looking more exposure{'\n'}
                            • Storefront businesses wanting maximum visibility{'\n'}
                            • Freelancers offering in-person or mixed services
                        </Text>
                    </View>
                </LinearGradient>

                {/* Sign-Up Fee */}
                <LinearGradient
                    colors={['#EC008C', '#FC6767']}
                    style={tw`rounded-xl mx-5  p-4 relative`}
                >
                    <View style={tw`absolute -top-8 left-[45%]  border-8 rounded-full border-primary`}>
                        <SvgXml xml={IconOneTime} />
                    </View>
                    <View style={tw`py-10 px-6`}>
                        <Text style={tw`text-white font-poppinsMedium text-xl mb-2 text-center `}>  One-Time Sign-Up Fee: ${priceOnSide?.data?.onsite_account_creation}</Text>
                        <Text style={tw`text-white  leading-6 font-poppins text-base`}>
                            • Video recording on-site{'\n'}
                            • Local SEO optimization{'\n'}
                            • Upload + Profile Setup{'\n'}
                            • Promotion across MyTSV.com channels
                        </Text>
                    </View>
                </LinearGradient>

                <View style={tw`px-6 `}>
                    <Text style={tw`text-center font-poppins text-xl p-4`}>Ready to Get Started?</Text>
                    <Text style={tw`text-center font-poppins text-base`}>
                        Our representative will assist you on-site. You can pay below and they'll handle the rest — including filming, uploading, and account setup.  You're not just advertising. You're being *seen in action* by real potential clients in your area.
                    </Text>
                </View>

                {/* Register Button */}
                <View style={tw`px-5 mb-10 mt-6`}>
                    <TouchableOpacity
                        style={tw`flex-row items-center gap-2 py-5 bg-secondary px-4 rounded-full justify-center`}
                        onPress={() => setPayRegisterModal(true)}
                    >
                        <Text style={tw`text-primaryText text-lg font-poppinsMedium`}>
                            Pay & register now
                        </Text>
                        <SvgXml xml={IconErowWhite} />
                    </TouchableOpacity>
                </View>

                {/* Registration Modal */}
                <Modal
                    visible={payRegisterModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setPayRegisterModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContainer, tw`h-[90%]`]}>
                            {/* Modal Header */}
                            <View style={tw`bg-secondary  h-16 rounded-t-2xl flex-row items-center justify-between px-5`}>
                                <View style={tw`w-6`}></View>
                                <Text style={tw`font-poppinsMedium text-lg text-primary`}>
                                    Onsite account creation
                                </Text>
                                <TouchableOpacity onPress={() => setPayRegisterModal(false)}>
                                    <SvgXml xml={IconClose} />
                                </TouchableOpacity>
                            </View>

                            <Formik
                                initialValues={{
                                    representative: "",
                                    channel_name: "",
                                    name: "",
                                    email: "",
                                    password: "",
                                    c_password: "",
                                }}
                                validationSchema={Yup.object({
                                    representative: Yup.string().required("Representative secret key is required"),
                                    channel_name: Yup.string().required("Channel name is required"),
                                    name: Yup.string().required("Name is required"),
                                    email: Yup.string().email("Invalid email format").required("Email is required"),
                                    password: Yup.string()
                                        .min(6, "Password must be at least 6 characters")
                                        .required("Password is required"),
                                    c_password: Yup.string()
                                        .oneOf([Yup.ref('password')], "Passwords must match")
                                        .required("Confirm password is required"),
                                })}
                                onSubmit={(values) => handleSubmit(values)}
                            >
                                {({ values, setFieldValue, handleSubmit, errors, touched }) => (
                                    <KeyboardAvoidingView
                                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                                        style={tw`flex-1`}
                                    >
                                        <ScrollView
                                            contentContainerStyle={tw`pb-8`}
                                            showsVerticalScrollIndicator={false}
                                            style={tw`flex-1`}
                                        >
                                            <View style={tw`bg-primary p-5`}>
                                                <View style={tw`flex-col justify-center items-center gap-4 py-4`}>
                                                    <Image
                                                        source={ImgLogo}
                                                        style={{ height: 40, width: 130, objectFit: "contain" }}
                                                    />
                                                    <Text style={tw`text-xl font-poppinsSemiBold text-secondary text-center`}>
                                                        Create an account
                                                    </Text>
                                                </View>

                                                {/* Form fields */}
                                                <View style={tw`mt-4`}>
                                                    {/* Representative secret key */}
                                                    <View style={tw`mb-4`}>
                                                        <TextInput
                                                            style={tw`border ${touched.representative && errors.representative ? 'border-red-500' : 'border-primaryGray'} rounded-full font-poppins text-base px-5 h-14`}
                                                            placeholder="Representative secret key"
                                                            placeholderTextColor="#777"
                                                            value={values.representative}
                                                            onChangeText={(txt) => setFieldValue("representative", txt)}
                                                        />
                                                        {touched.representative && errors.representative && (
                                                            <Text style={tw`text-red-600 font-poppins text-sm mt-1 ml-2`}>
                                                                {errors.representative}
                                                            </Text>
                                                        )}
                                                    </View>

                                                    {/* Channel Name */}
                                                    <View style={tw`mb-4`}>
                                                        <TextInput
                                                            style={tw`border ${touched.channel_name && errors.channel_name ? 'border-red-500' : 'border-primaryGray'} rounded-full font-poppins text-base px-5 h-14`}
                                                            placeholder="Channel Name"
                                                            placeholderTextColor="#777"
                                                            value={values.channel_name}
                                                            onChangeText={(txt) => setFieldValue("channel_name", txt)}
                                                        />
                                                        {touched.channel_name && errors.channel_name && (
                                                            <Text style={tw`text-red-600 font-poppins text-sm mt-1 ml-2`}>
                                                                {errors.channel_name}
                                                            </Text>
                                                        )}
                                                    </View>

                                                    {/* Name */}
                                                    <View style={tw`mb-4`}>
                                                        <TextInput
                                                            style={tw`border ${touched.name && errors.name ? 'border-red-500' : 'border-primaryGray'} rounded-full font-poppins text-base px-5 h-14`}
                                                            placeholder="Name"
                                                            placeholderTextColor="#777"
                                                            value={values.name}
                                                            onChangeText={(txt) => setFieldValue("name", txt)}
                                                        />
                                                        {touched.name && errors.name && (
                                                            <Text style={tw`text-red-600 font-poppins text-sm mt-1 ml-2`}>
                                                                {errors.name}
                                                            </Text>
                                                        )}
                                                    </View>

                                                    {/* Email */}
                                                    <View style={tw`mb-4`}>
                                                        <TextInput
                                                            style={tw`border ${touched.email && errors.email ? 'border-red-500' : 'border-primaryGray'} rounded-full font-poppins text-base px-5 h-14`}
                                                            placeholder="Email"
                                                            placeholderTextColor="#777"
                                                            keyboardType="email-address"
                                                            autoCapitalize="none"
                                                            value={values.email}
                                                            onChangeText={(txt) => setFieldValue("email", txt)}
                                                        />
                                                        {touched.email && errors.email && (
                                                            <Text style={tw`text-red-600 font-poppins text-sm mt-1 ml-2`}>
                                                                {errors.email}
                                                            </Text>
                                                        )}
                                                    </View>

                                                    {/* Password */}
                                                    <View style={tw`mb-4 relative`}>
                                                        <TextInput
                                                            style={tw`border ${touched.password && errors.password ? 'border-red-500' : 'border-primaryGray'} rounded-full font-poppins text-base px-5 h-14 pr-12`}
                                                            placeholder="Password"
                                                            placeholderTextColor="#777"
                                                            secureTextEntry={!showNewPassword}
                                                            value={values.password}
                                                            onChangeText={(txt) => setFieldValue("password", txt)}
                                                        />
                                                        <TouchableOpacity
                                                            style={tw`absolute right-4 top-4`}
                                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                                        >
                                                            <Entypo
                                                                name={showNewPassword ? "eye" : "eye-with-line"}
                                                                size={20}
                                                                color="#777"
                                                            />
                                                        </TouchableOpacity>
                                                        {touched.password && errors.password && (
                                                            <Text style={tw`text-red-600 font-poppins text-sm mt-1 ml-2`}>
                                                                {errors.password}
                                                            </Text>
                                                        )}
                                                    </View>

                                                    {/* Confirm Password */}
                                                    <View style={tw`mb-6 relative`}>
                                                        <TextInput
                                                            style={tw`border ${touched.c_password && errors.c_password ? 'border-red-500' : 'border-primaryGray'} rounded-full font-poppins text-base px-5 h-14 pr-12`}
                                                            placeholder="Confirm password"
                                                            placeholderTextColor="#777"
                                                            secureTextEntry={!showConfirmPassword}
                                                            value={values.c_password}
                                                            onChangeText={(txt) => setFieldValue("c_password", txt)}
                                                        />
                                                        <TouchableOpacity
                                                            style={tw`absolute right-4 top-4`}
                                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            <Entypo
                                                                name={showConfirmPassword ? "eye" : "eye-with-line"}
                                                                size={20}
                                                                color="#777"
                                                            />
                                                        </TouchableOpacity>
                                                        {touched.c_password && errors.c_password && (
                                                            <Text style={tw`text-red-600 font-poppins text-sm mt-1 ml-2`}>
                                                                {errors.c_password}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>

                                                {/* Submit Button */}
                                                <TouchableOpacity
                                                    style={tw`bg-secondary rounded-full ${isSubmitting ? 'opacity-70' : ''}`}
                                                    onPress={() => handleSubmit()}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <View style={tw`py-4 flex-row justify-center items-center`}>
                                                            <ActivityIndicator color="white" />
                                                            <Text style={tw`text-primaryText text-lg font-poppinsBold ml-2`}>
                                                                Processing...
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <Text style={tw`text-primaryText text-center text-lg py-4 font-poppinsBold`}>
                                                            Create account
                                                        </Text>
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                        </ScrollView>
                                    </KeyboardAvoidingView>
                                )}
                            </Formik>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    )
}

export default OnsiteAccountScreen

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: _HIGHT * 0.85,
        width: '100%',
    },
});