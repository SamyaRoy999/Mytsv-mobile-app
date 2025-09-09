import HeaderBar from '@/components/shear/HeaderBar'
import { IconbackRight, IconContactusImg, IconEmail, IconLoction, IconPhone, IconSend } from '@/icons/Icon'
import tw from '@/lib/tailwind'
import { useContact_send_messageMutation, useContact_usQuery } from '@/redux/apiSlices/Account/accountSlice'
import { router } from 'expo-router'
import { Formik } from 'formik'
import React from 'react'
import { KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification'
import { SvgXml } from 'react-native-svg'
import * as Yup from "yup"

const contactUs = () => {

    const { data: contact_us, isLoading, error } = useContact_usQuery({})
    const [contact_send_message] = useContact_send_messageMutation();

    if (isLoading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text>loading failed faqs data</Text>
            </View>
        );
    }
    const { email, phone, address } = contact_us?.data

    //  ..........api call send message........

    return (
        <KeyboardAvoidingView
            enabled={true}
            behavior={"padding"}
            style={tw`bg-primary`}>
            <ScrollView contentContainerStyle={tw`p-4 mb-6`}
                showsVerticalScrollIndicator={false}
            >
                <AlertNotificationRoot>
                    <HeaderBar />
                    <TouchableOpacity style={tw``} onPress={() => router.back()}>
                        <SvgXml xml={IconbackRight} />
                    </TouchableOpacity>
                    {/* Top Logo and Image */}
                    <View style={tw`items-center `}>
                        <SvgXml xml={IconContactusImg} />
                    </View>
                    {/* Title */}
                    <Text style={tw`text-lg font-poppinsMedium text-center  mb-8 bg-primaryText py-4 rounded-full`}>Contact us</Text>

                    {/* Mission Section */}
                    <View style={tw`border rounded-xl p-7 mb-4 border-primaryGray`}>
                        <View style={tw`flex-row items-center gap-2 `}>
                            <Text style={tw`text-xl font-poppinsMedium mb-2 `} >Get in touch</Text>
                        </View>
                        <Text style={tw`text-base pt-5  font-poppins `}>
                            We’d love to hear from you! Reach out to us through any of the following methods:
                        </Text>
                        <View style={tw`flex-row items-center gap-3 pt-9`}>
                            <SvgXml xml={IconEmail} />
                            <Text style={tw`text-base font-poppins `}>
                                {email}
                            </Text>
                        </View>
                        <View style={tw`flex-row items-center gap-3 pt-9`}>
                            <SvgXml xml={IconPhone} />
                            <Text style={tw`text-base font-poppins `}>
                                {phone}
                            </Text>
                        </View>
                        <View style={tw`flex-row items-center gap-3 pt-9`}>
                            <SvgXml xml={IconLoction} />
                            <Text style={tw`text-base font-poppins `}>
                                {address}
                            </Text>
                        </View>
                    </View>
                    <Formik
                        initialValues={{
                            name: "",
                            email: "",
                            subject: "",
                            message: ""
                        }}
                        validationSchema={Yup.object({
                            name: Yup.string().required("Name is required"),
                            email: Yup.string().email().required("Email is required"),
                            subject: Yup.string().required("Subject is required"),
                            message: Yup.string().min(15).required("Message is required"),

                        })}
                        onSubmit={async (values) => {
                            try {
                                const res = await contact_send_message(values).unwrap();

                                if (res.status) {
                                    Toast.show({
                                        type: ALERT_TYPE.SUCCESS,
                                        title: 'Success',
                                        textBody: res?.message,
                                        autoClose: 2000,
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
                                    textBody: error?.message,
                                });

                                (error);
                            }
                        }}
                    >
                        {({ values, setFieldValue, handleSubmit, errors }) => {
                            return (
                                <View>
                                    <View style={tw`flex-col gap-6 mt-9`}>
                                        <View style={tw`relative`}>
                                            <View style={tw`bg-primary absolute px-4 flex-row justify-center items-center left-7 font-poppins text-base -top-2 z-10`}>
                                                <Text style={tw`font-poppins text-base`}>* Name</Text>
                                            </View>
                                            <TextInput
                                                style={tw`border border-primaryGray rounded-full font-poppins text-base px-5 h-16`}
                                                value={values.name}
                                                onChangeText={(txt) =>
                                                    setFieldValue("name", txt)
                                                }
                                            />
                                            {errors.name && (
                                                <Text style={tw`text-left pl-6 text-red-700 font-poppins`}>
                                                    {errors.name}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={tw`relative`}>
                                            <View style={tw`bg-primary absolute px-4 flex-row justify-center items-center left-7 font-poppins text-base -top-2 z-10`}>
                                                <Text style={tw`font-poppins text-base`}>* Email</Text>
                                            </View>
                                            <TextInput
                                                style={tw`border border-primaryGray rounded-full font-poppins text-base px-5 h-16`}
                                                value={values.email}
                                                onChangeText={(txt) =>
                                                    setFieldValue("email", txt)
                                                }
                                            />
                                            {errors.email && (
                                                <Text style={tw`text-left pl-6 text-red-700 font-poppins`}>
                                                    {errors.email}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={tw`relative`}>
                                            <View style={tw`bg-primary absolute px-4 flex-row justify-center items-center left-7 font-poppins text-base -top-2 z-10`}>
                                                <Text style={tw`font-poppins text-base`}>* Subject</Text>
                                            </View>
                                            <TextInput
                                                style={tw`border border-primaryGray rounded-full font-poppins text-base px-5 h-16`}
                                                value={values.subject}
                                                onChangeText={(txt) =>
                                                    setFieldValue("subject", txt)
                                                }
                                            />
                                            {errors.subject && (
                                                <Text style={tw`text-left pl-6 text-red-700 font-poppins`}>
                                                    {errors.subject}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={tw`relative`}>
                                            <View style={tw`bg-primary absolute px-4 flex-row justify-center items-center left-7 font-poppins text-base -top-2 z-10`}>
                                                <Text style={tw`font-poppins text-base`}>* Your message</Text>
                                            </View>
                                            <TextInput
                                                style={tw`border border-primaryGray rounded-xl font-poppins text-base px-5 h-40`}
                                                textAlignVertical='top'
                                                value={values.message}
                                                onChangeText={(txt) =>
                                                    setFieldValue("message", txt)
                                                }
                                            />
                                            {errors.message && (
                                                <Text style={tw`text-left pl-6 text-red-700 font-poppins`}>
                                                    {errors.message}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={tw`flex-row items-center gap-2 py-5 bg-secondary px-4  mt-14 rounded-full justify-center`}
                                        onPress={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        <Text style={tw`text-primaryText text-base font-poppinsBold`}>
                                            Send message
                                        </Text>
                                        <SvgXml xml={IconSend} />
                                    </TouchableOpacity>
                                </View>
                            );
                        }}
                    </Formik>
                </AlertNotificationRoot>
            </ScrollView>
        </KeyboardAvoidingView >
    )
}

export default contactUs