import {
  Body,
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

interface PasswordChangedProps {
  pseudo?: string;
  subject: string;
  title?: string;
  description?: string;
  ifNotYou?: string;
  ifYou?: string;
  formattedDate?: string;
}

const baseUrl = process.env.APP_DOMAIN ? `${process.env.APP_DOMAIN}` : '';
const appName = process.env.APP_NAME ? `${process.env.APP_NAME}` : '';
const appDomain = process.env.APP_DOMAIN ? `${process.env.APP_DOMAIN}` : '';

export const PasswordChanged = ({
  subject,
  title,
  pseudo,
  ifNotYou,
  description,
}: PasswordChangedProps) => {
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
                src="https://images.pexels.com/photos/792031/pexels-photo-792031.jpeg?auto=compress&crop=center&format=crop&h=200&w=600"
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
                <Text style={paragraph}>{ifNotYou}</Text>
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

PasswordChanged.PreviewProps = {
  pseudo: 'Alan',
  subject: 'Password changed successfully',
  title: 'Hi',
  action: 'Your password has been changed successfully',
  description: 'Your password has been changed successfully.',
  ifNotYou:
    'If you did not request a password reset, please contact support for assistance.',
} as PasswordChangedProps;

export default PasswordChanged;

const main = {
  backgroundColor: '#fff',
  paddingTop: '40px',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
  fontSize: 16,
};

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden',
};

const image = {
  maxWidth: '100%',
};

const boxInfos = {
  padding: '20px',
};

const containerImageFooter = {
  display: 'flex',
  justifyContent: 'center',
  padding: '45px 0 90px 0',
};
