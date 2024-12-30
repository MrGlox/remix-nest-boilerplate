import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

// biome-ignore lint/correctness/noUnusedImports: Needs react imports
import * as React from 'react';

interface ForgotPasswordProps {
  pseudo?: string;
  subject: string;
  url: string;
  title?: string;
  ifNotYou?: string;
  description?: string;
  time?: string;
  ifYou?: string;
  cta?: string;
  formattedDate?: string;
}

const baseUrl = process.env.APP_DOMAIN ? `${process.env.APP_DOMAIN}` : '';
const appName = process.env.APP_NAME ? `${process.env.APP_NAME}` : '';
const appDomain = process.env.APP_DOMAIN ? `${process.env.APP_DOMAIN}` : '';

export const ForgotPassword = ({
  subject,
  title,
  time,
  pseudo,
  ifNotYou,
  description,
  ifYou,
  cta,
  url,
  formattedDate,
}: ForgotPasswordProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Row>
              <Img
                style={image}
                height={200}
                width="100%"
                src="https://images.pexels.com/photos/792031/pexels-photo-792031.jpeg?auto=compress&crop=center&format=crop&h=400&w=600"
              />
            </Row>

            <Row style={{ ...boxInfos, paddingBottom: '0' }}>
              <Column>
                <Heading
                  style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {title} {pseudo}!
                </Heading>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {description}
                </Heading>
                <Hr />
                <Text style={paragraph}>
                  <b>{time} </b>
                  {formattedDate}
                </Text>
                {/* <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Device: </b>
                  {loginDevice}
                </Text> */}
                {/* <Text style={{ ...paragraph, marginTop: -5 }}>
                  <b>Location: </b>
                  {loginLocation}
                </Text> */}
                {/* <Text
                  style={{
                    color: 'rgb(0,0,0, 0.5)',
                    fontSize: 14,
                    marginTop: -5,
                  }}
                >
                  *Approximate geographic location based on IP address:
                  {loginIp}
                </Text> */}

                <Text style={paragraph}>{ifNotYou}</Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>{ifYou}</Text>
              </Column>
            </Row>
            <Row style={{ ...boxInfos, paddingTop: '0' }}>
              <Column style={containerButton} colSpan={2}>
                <Button href={url} style={button}>
                  {cta}
                </Button>
              </Column>
            </Row>
          </Section>
        </Container>
        <Section style={containerImageFooter}>
          <Row>
            <Column
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Img width={80} src={`${baseUrl}/images/brand.png`} />

              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'rgb(0,0,0, 0.7)',
                }}
              >
                © {new Date().getFullYear()} | {appName} |{appDomain}
              </Text>
            </Column>
          </Row>
        </Section>
      </Body>
    </Html>
  );
};

ForgotPassword.PreviewProps = {
  pseudo: 'Alan',
  subject: 'Reset your password',
  title: 'Hi',
  description:
    'You are receiving this email because we received a password reset request for your account.',
  ifNotYou:
    'If you did not request a password reset, please ignore this email or contact support for assistance.',
  ifYou:
    'To reset your password, click the button below and follow the instructions.',
  cta: 'Reset Password',
} as ForgotPasswordProps;

export default ForgotPassword;

const main = {
  paddingTop: '40px',
  backgroundColor: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
  fontSize: 16,
};

const containerButton = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
};

const button = {
  backgroundColor: '#e00707',
  borderRadius: 3,
  color: '#FFF',
  fontWeight: 'bold',
  border: '1px solid rgb(0,0,0, 0.1)',
  cursor: 'pointer',
  padding: '12px 30px',
};

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden',
};

const image: React.CSSProperties = {
  maxWidth: '100%',
  objectFit: 'cover' as React.CSSProperties['objectFit'],
};

const boxInfos = {
  padding: '20px',
};

const containerImageFooter = {
  display: 'flex',
  justifyContent: 'center',
  padding: '45px 0 90px 0',
};
